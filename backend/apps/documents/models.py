from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from pgvector.django import VectorField

User = get_user_model()


class Document(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)

    # We store the file in Supabase, this just saves the path/url
    file_url = models.URLField(max_length=500, blank=True, null=True)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20)  # pdf, docx, xlsx
    file_size = models.IntegerField(help_text='File size in bytes')

    page_count = models.IntegerField(default=0)
    chunk_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(null=True, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['-uploaded_at']),
        ]

    def __str__(self):
        return f'{self.title} — {self.user.email}'

    def mark_processing(self):
        self.status = 'processing'
        self.save(update_fields=['status'])

    def mark_completed(self, chunk_count, page_count):
        self.status = 'completed'
        self.chunk_count = chunk_count
        self.page_count = page_count
        self.processed_at = timezone.now()
        self.save(update_fields=['status', 'chunk_count', 'page_count', 'processed_at'])

    def mark_failed(self, error):
        self.status = 'failed'
        self.error_message = error
        self.save(update_fields=['status', 'error_message'])


class DocumentChunk(models.Model):
    """
    Each document is split into chunks.
    Each chunk has an embedding vector for similarity search.
    This is the core of RAG.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    chunk_index = models.IntegerField()
    page_number = models.IntegerField(null=True, blank=True)
    token_count = models.IntegerField(default=0)

    # 768 dimensions = Gemini embedding size
    embedding = VectorField(dimensions=768, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_chunks'
        ordering = ['chunk_index']
        unique_together = ['document', 'chunk_index']
        indexes = [
            models.Index(fields=['document', 'chunk_index']),
        ]

    def __str__(self):
        return f'Chunk {self.chunk_index} — {self.document.title}'