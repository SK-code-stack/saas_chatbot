import uuid
from supabase import create_client
from django.conf import settings


class SupabaseStorageService:

    def __init__(self):
        self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.bucket = settings.SUPABASE_BUCKET

    def upload_file(self, file, user_id, original_filename):
        """
        Upload file to Supabase Storage.
        Returns the public URL of the uploaded file.
        We use UUID in filename to avoid collisions.
        """
        extension = original_filename.rsplit('.', 1)[-1].lower()
        unique_filename = f"{user_id}/{uuid.uuid4()}.{extension}"

        file_bytes = file.read()

        content_type_map = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
        content_type = content_type_map.get(extension, 'application/octet-stream')

        self.client.storage.from_(self.bucket).upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": content_type}
        )

        public_url = self.client.storage.from_(self.bucket).get_public_url(unique_filename)
        return public_url, unique_filename

    def delete_file(self, file_path):
        """Delete file from Supabase Storage."""
        try:
            self.client.storage.from_(self.bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"[Storage] Delete error: {e}")
            return False