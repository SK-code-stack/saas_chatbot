# Expose Celery app so `python -m celery -A config` can find it
from .celery import app as celery_app

__all__ = ('celery_app',)
