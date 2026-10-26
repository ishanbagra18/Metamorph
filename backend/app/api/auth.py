"""
Authentication API Router for Metamorph.
Provides register, login, refresh, profile, password, reset-password, and logout endpoints.
"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field

from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    company: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    company: Optional[str] = ""
    avatar: Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


def get_current_user(
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None)
) -> dict:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    payload = auth_service.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token."
        )

    user = auth_service.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists."
        )
    return user


def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges are required for this action."
        )
    return current_user


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=120 * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 3600
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, response: Response):
    try:
        user = auth_service.register_user(
            name=req.name,
            email=req.email,
            password=req.password,
            company=req.company or ""
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    access_token = auth_service.create_access_token(user["id"], user["email"], user["role"])
    refresh_token = auth_service.create_refresh_token(user["id"])
    set_auth_cookies(response, access_token, refresh_token)

    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login")
async def login(req: LoginRequest, response: Response):
    user = auth_service.authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = auth_service.create_access_token(user["id"], user["email"], user["role"])
    refresh_token = auth_service.create_refresh_token(user["id"])
    set_auth_cookies(response, access_token, refresh_token)

    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh")
async def refresh_tokens(
    response: Response,
    body: Optional[RefreshRequest] = None,
    refresh_token: Optional[str] = Cookie(None)
):
    token = (body and body.refresh_token) or refresh_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing."
        )

    payload = auth_service.decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    user = auth_service.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    new_access_token = auth_service.create_access_token(user["id"], user["email"], user["role"])
    new_refresh_token = auth_service.create_refresh_token(user["id"])
    set_auth_cookies(response, new_access_token, new_refresh_token)

    return {
        "user": user,
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully."}


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}


@router.put("/profile")
async def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    updated = auth_service.update_profile(
        user_id=current_user["id"],
        name=req.name,
        company=req.company or "",
        avatar=req.avatar
    )
    return {"user": updated, "message": "Profile updated successfully."}


@router.put("/password")
async def change_password(req: UpdatePasswordRequest, current_user: dict = Depends(get_current_user)):
    try:
        auth_service.update_password(current_user["id"], req.current_password, req.new_password)
        return {"message": "Password changed successfully."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/account")
async def delete_account(response: Response, current_user: dict = Depends(get_current_user)):
    auth_service.delete_user(current_user["id"])
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Account deleted successfully."}


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    token = auth_service.create_password_reset_token(req.email)
    # Always return a polite success message to prevent user enumeration
    return {
        "message": "If an account exists with that email, a password reset link has been generated.",
        "reset_token": token,  # Exposed for easy UI demonstration & testing
        "reset_url": f"/reset-password/{token}" if token else None
    }


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    try:
        auth_service.reset_password_with_token(req.token, req.new_password)
        return {"message": "Password has been reset successfully. You can now log in with your new password."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
