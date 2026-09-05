from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings


def _build_async_url(url: str) -> str:
    """
    Convert a standard postgresql:// URL (from Neon/Supabase) to a
    postgresql+asyncpg:// URL that asyncpg can use.

    Strips params asyncpg does not understand (sslmode, channel_binding)
    and replaces them with the asyncpg-compatible ssl=require param.
    """
    url = url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)

    # Remove params asyncpg does not support
    for key in ('sslmode', 'channel_binding'):
        params.pop(key, None)

    # Add asyncpg SSL param
    params['ssl'] = ['require']

    new_query = urlencode({k: v[0] for k, v in params.items()})
    new_parsed = parsed._replace(query=new_query)
    return urlunparse(new_parsed)


DATABASE_URL = _build_async_url(settings.DATABASE_URL)

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    """Dependency — provides DB session to routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()