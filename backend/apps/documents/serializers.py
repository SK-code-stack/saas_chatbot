from rest_framework import serializers
from .models import Document, DocumentChunk


class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['id', 'content', 'chunk_index', 'page_number', 'token_count']


class DocumentSerializer(serializers.ModelSerializer):
    is_ready = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file_name', 'file_type', 'file_size',
            'file_url', 'page_count', 'chunk_count', 'status',
            'error_message', 'uploaded_at', 'processed_at', 'is_ready'
        ]
        read_only_fields = fields

    def get_is_ready(self, obj):
        return obj.status == 'completed'


class DocumentUploadSerializer(serializers.Serializer):
    """Only used for validating the incoming upload request."""
    file = serializers.FileField()

    ALLOWED_TYPES = ['pdf', 'docx', 'xlsx']
    MAX_SIZE = 10 * 1024 * 1024  # 10MB

    def validate_file(self, file):
        extension = file.name.rsplit('.', 1)[-1].lower()

        if extension not in self.ALLOWED_TYPES:
            raise serializers.ValidationError(
                f'Unsupported file type. Allowed: {", ".join(self.ALLOWED_TYPES)}'
            )
        if file.size > self.MAX_SIZE:
            raise serializers.ValidationError('File size cannot exceed 10MB')

        return file