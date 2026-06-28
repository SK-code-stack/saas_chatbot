from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    FASTAPI_INTERNAL_SECRET: str

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / '.env')
        extra = 'ignore'  

settings = Settings()