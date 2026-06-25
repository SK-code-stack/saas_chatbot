
# POST   /api/documents/upload/       → Upload + process document
# GET    /api/documents/              → List user's documents
# GET    /api/documents/<id>/         → Get single document
# GET    /api/documents/<id>/status/  → Get processing status
# DELETE /api/documents/<id>/         → Delete document

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

router = DefaultRouter()
router.register('', DocumentViewSet, basename='documents')

urlpatterns = [
    path('', include(router.urls)),
]