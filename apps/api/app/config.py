from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_cors_origins: str = "http://localhost:3000"
    kijanispace_api_base_url: str = "https://api.kijanispace.eu"
    kijanispace_username: str | None = None
    kijanispace_password: SecretStr | None = None
    feed_sync_db_path: str = "data/feed_sync.db"
    feed_sync_cloud_sql_instance: str | None = None
    feed_sync_db_name: str = "feedsync"
    feed_sync_db_user: str = "feedsync_app"
    feed_sync_db_password: SecretStr | None = None
    farm_manager_email: str | None = None
    auth_secret_key: SecretStr = "a_very_secret_key_that_should_be_in_env"
    auth_algorithm: str = "HS256"
    auth_access_token_expire_minutes: int = 30

    @property
    def database_url(self) -> str | None:
        if not self.feed_sync_cloud_sql_instance or not self.feed_sync_db_password:
            return None
        return (
            f"postgresql://{self.feed_sync_db_user}:{self.feed_sync_db_password.get_secret_value()}"
            f"@/{self.feed_sync_db_name}?host=/cloudsql/{self.feed_sync_cloud_sql_instance}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.api_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()