from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Document, DocumentChunk
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .services.storage_service import SupabaseStorageService
from .services.parser_service import ParserService
from .services.chunking_service import ChunkingService
from .services.embedding_service import EmbeddingService


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users only see their own documents
        return Document.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        Full pipeline:
        1. Validate file
        2. Upload to Supabase Storage
        3. Save Document record to DB
        4. Parse text from file
        5. Chunk the text
        6. Generate embeddings
        7. Return result
        """
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_type = file.name.rsplit('.', 1)[-1].lower()
        title = file.name.rsplit('.', 1)[0]

        # Step 1: Upload to Supabase
        try:
            storage = SupabaseStorageService()
            file_bytes = file.read()
            file.seek(0)  # reset for re-reading

            import io
            file_obj = io.BytesIO(file_bytes)
            file_obj.name = file.name

            file_url, file_path = storage.upload_file(
                file_obj, request.user.id, file.name
            )
        except Exception as e:
            return Response(
                {'error': f'File upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Step 2: Save document record
        document = Document.objects.create(
            user=request.user,
            title=title,
            file_url=file_url,
            file_name=file.name,
            file_type=file_type,
            file_size=file.size,
        )

        document.mark_processing()

        # Step 3: Parse
        try:
            parsed_data = ParserService.parse(file_bytes, file_type)
        except Exception as e:
            document.mark_failed(f'Parsing failed: {str(e)}')
            return Response(
                {'error': f'Could not parse file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 4: Chunk
        try:
            chunk_count = ChunkingService.chunk_and_save(document, parsed_data)
        except Exception as e:
            document.mark_failed(f'Chunking failed: {str(e)}')
            return Response(
                {'error': f'Chunking failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Step 5: Embed
        try:
            embedding_service = EmbeddingService()
            embedded_count = embedding_service.embed_document(document)
        except Exception as e:
            document.mark_failed(f'Embedding failed: {str(e)}')
            return Response(
                {'error': f'Embedding failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        document.mark_completed(chunk_count, parsed_data['page_count'])

        return Response({
            'message': 'Document uploaded and processed successfully',
            'document': {
                'id': document.id,
                'title': document.title,
                'file_type': document.file_type,
                'page_count': document.page_count,
                'chunk_count': document.chunk_count,
                'status': document.status,
            }
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        document = self.get_object()
        return Response({
            'id': document.id,
            'status': document.status,
            'chunk_count': document.chunk_count,
            'page_count': document.page_count,
            'is_ready': document.status == 'completed',
            'error_message': document.error_message,
        })

    def destroy(self, request, pk=None):
        document = self.get_object()
        # TODO: also delete from Supabase storage in Phase 4
        document.delete()
        return Response({'message': 'Document deleted'}, status=status.HTTP_204_NO_CONTENT)