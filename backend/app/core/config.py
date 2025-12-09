from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ChromaMind"
    admin_email: str = "admin@chromamind.com"

    class Config:
        env_file = ".env"


settings = Settings()