"""
Authentication and User Persistence Service for Metamorph.
Handles password hashing, JWT generation, user credentials, roles, and profile management in SQLite.
"""
from __future__ import annotations

import datetime
import sqlite3
import uuid
from pathlib import Path
from typing import Dict, List, Optional
import bcrypt
import jwt

from app.config import settings


class AuthService:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.RUNS_DB_PATH
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE COLLATE NOCASE,
                    name TEXT NOT NULL,
                    hashed_password TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    company TEXT DEFAULT '',
                    avatar TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS password_resets (
                    token TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

            # Seed a default admin if table is empty so user has immediate access out of the box
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM users")
            if cursor.fetchone()["count"] == 0:
                admin_id = f"usr_{uuid.uuid4().hex[:8]}"
                hashed = self.hash_password("Admin@123456")
                conn.execute(
                    """
                    INSERT INTO users (id, email, name, hashed_password, role, company, avatar)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (admin_id, "admin@metamorph.dev", "Metamorph Admin", hashed, "admin", "Metamorph Labs", "https://api.dicebear.com/7.x/bottts/svg?seed=metamorph-admin")
                )
                conn.commit()

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    def create_access_token(self, user_id: str, email: str, role: str) -> str:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "access",
            "exp": expire
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def create_refresh_token(self, user_id: str) -> str:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": expire
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    def decode_token(self, token: str) -> Optional[dict]:
        try:
            return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        except Exception:
            return None

    def register_user(self, name: str, email: str, password: str, company: str = "") -> dict:
        email = email.strip().lower()
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters.")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                raise ValueError("An account with this email already exists.")

            # If this is the second user after default admin or first custom, determine role
            cursor.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()["count"]
            role = "user"  # Normal registrations are users

            user_id = f"usr_{uuid.uuid4().hex[:8]}"
            hashed = self.hash_password(password)
            avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}"

            conn.execute(
                """
                INSERT INTO users (id, email, name, hashed_password, role, company, avatar)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, email, name.strip(), hashed, role, company.strip(), avatar)
            )
            conn.commit()

            return {
                "id": user_id,
                "email": email,
                "name": name.strip(),
                "role": role,
                "company": company.strip(),
                "avatar": avatar,
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        email = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                return None
            if not self.verify_password(password, row["hashed_password"]):
                return None
            return {
                "id": row["id"],
                "email": row["email"],
                "name": row["name"],
                "role": row["role"],
                "company": row["company"] or "",
                "avatar": row["avatar"] or "",
                "created_at": str(row["created_at"])
            }

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, role, company, avatar, created_at FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "email": row["email"],
                "name": row["name"],
                "role": row["role"],
                "company": row["company"] or "",
                "avatar": row["avatar"] or "",
                "created_at": str(row["created_at"])
            }

    def update_profile(self, user_id: str, name: str, company: str, avatar: Optional[str] = None) -> dict:
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE users 
                SET name = ?, company = ?, avatar = COALESCE(?, avatar), updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (name.strip(), company.strip(), avatar, user_id)
            )
            conn.commit()
            return self.get_user_by_id(user_id)

    def update_password(self, user_id: str, current_password: str, new_password: str):
        if len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters.")

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT hashed_password FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row or not self.verify_password(current_password, row["hashed_password"]):
                raise ValueError("Current password does not match.")

            new_hashed = self.hash_password(new_password)
            conn.execute("UPDATE users SET hashed_password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_hashed, user_id))
            conn.commit()

    def delete_user(self, user_id: str):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()

    def list_users(self) -> List[dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, name, role, company, avatar, created_at FROM users ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "email": r["email"],
                    "name": r["name"],
                    "role": r["role"],
                    "company": r["company"] or "",
                    "avatar": r["avatar"] or "",
                    "created_at": str(r["created_at"])
                }
                for r in rows
            ]

    def update_user_role(self, user_id: str, new_role: str):
        if new_role not in ["admin", "user"]:
            raise ValueError("Role must be 'admin' or 'user'.")
        with self._get_connection() as conn:
            conn.execute("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_role, user_id))
            conn.commit()

    def create_password_reset_token(self, email: str) -> Optional[str]:
        email = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                return None
            token = f"rst_{uuid.uuid4().hex}"
            expires_at = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)).isoformat()
            conn.execute("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)", (token, row["id"], expires_at))
            conn.commit()
            return token

    def reset_password_with_token(self, token: str, new_password: str):
        if len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters.")
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_id, expires_at FROM password_resets WHERE token = ?", (token,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("Invalid or expired password reset token.")
            # Verify expiry
            expires_at = datetime.datetime.fromisoformat(row["expires_at"])
            if expires_at < datetime.datetime.now(datetime.timezone.utc):
                raise ValueError("Reset token has expired.")

            user_id = row["user_id"]
            new_hashed = self.hash_password(new_password)
            conn.execute("UPDATE users SET hashed_password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_hashed, user_id))
            conn.execute("DELETE FROM password_resets WHERE token = ?", (token,))
            conn.commit()


auth_service = AuthService()
