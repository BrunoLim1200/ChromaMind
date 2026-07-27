from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from typing import Annotated, List


class Settings(BaseSettings):
    app_name: str = "ChromaMind"
    admin_email: str = "admin@chromamind.com"
    debug: bool = False
    # Comma-separated list of allowed CORS origins (see _split_origins).
    # NoDecode stops pydantic-settings from JSON-parsing the env value first,
    # which would raise SettingsError on a plain string like "" or "a,b".
    cors_origins: Annotated[List[str], NoDecode] = ["http://localhost:4200"]
    # Seconds browsers/CDNs may cache a generated palette (deterministic output).
    palette_cache_max_age: int = 86400

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        # Accept a comma-separated string from the environment as well as a list.
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
