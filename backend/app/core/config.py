from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "ChromaMind"
    admin_email: str = "admin@chromamind.com"
    items_per_page: int = 50
    database_url: str = "sqlite:///./test.db"

    class Config:
        env_file = ".env"

settings = Settings()