from pydantic_settings import BaseSettings
from pathlib import Path

# Point to root .env file
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    FASTAPI_INTERNAL_SECRET: str

    class Config:
        env_file = str(ROOT_DIR /'fastapi_service' / '.env')

settings = Settings()