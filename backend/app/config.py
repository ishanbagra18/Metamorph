import os
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    DEFAULT_LLM_PROVIDER: Literal["groq", "gemini"] = "groq"
    SANDBOX_MODE: Literal["docker", "subprocess", "auto"] = "auto"

    RUNS_DB_PATH: str = str(BASE_DIR / "runs.db")
    WORKSPACES_DIR: str = str(BASE_DIR / "workspaces")
    REPORTS_DIR: str = str(BASE_DIR / "reports")

    JWT_SECRET: str = "metamorph-super-secret-jwt-key-production-ready-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure directories exist
os.makedirs(settings.WORKSPACES_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
