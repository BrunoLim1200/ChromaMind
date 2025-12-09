from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    app_name: str = "ChromaMind"
    admin_email: str = "admin@chromamind.com"
    debug: bool = False
    cors_origins: List[str] = [
        "http://localhost:4200",
        "https://*.github.io"
    ]

    class Config:
        env_file = ".env"


settings = Settings()