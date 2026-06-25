from langchain_text_splitters import RecursiveCharacterTextSplitter
from ..models import DocumentChunk


class ChunkingService:

    @staticmethod
    def chunk_and_save(document, parsed_data):
        """
        Split text into chunks and save to DB.
        Returns number of chunks created.

        Why RecursiveCharacterTextSplitter:
        It tries to split on paragraphs first, then sentences,
        then words. This keeps context together better than
        splitting at fixed character counts.

        chunk_size=800    → each chunk ~800 characters
        chunk_overlap=100 → 100 chars overlap between chunks
                            so context isn't lost at boundaries
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            length_function=len,
        )

        # Delete old chunks if reprocessing
        DocumentChunk.objects.filter(document=document).delete()

        chunks_to_create = []
        chunk_index = 0

        for page in parsed_data['pages']:
            page_chunks = splitter.split_text(page['text'])

            for chunk_text in page_chunks:
                if chunk_text.strip():
                    chunks_to_create.append(DocumentChunk(
                        document=document,
                        content=chunk_text.strip(),
                        chunk_index=chunk_index,
                        page_number=page['page_number'],
                        token_count=len(chunk_text.split()),
                    ))
                    chunk_index += 1

        # Bulk create for performance
        DocumentChunk.objects.bulk_create(chunks_to_create)
        return chunk_index