from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.database import get_db
from core.config import settings
from services.embedding_service import EmbeddingService
from services.search_service import SearchService
from services.llm_service import LLMService

router = APIRouter()


# ── Request/Response Models ────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    document_ids: list[int]
    system_prompt: str = ""
    chat_history: list[dict] = []
    top_k: int = 5


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    chunks_used: int


# ── Internal auth check ────────────────────────────────────────────
def verify_internal_secret(x_internal_secret: str = Header(...)):
    """
    Django calls FastAPI internally using this secret.
    This prevents anyone from calling FastAPI directly.
    """
    if x_internal_secret != settings.FASTAPI_INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail='Unauthorized')


# ── Chat Endpoint ──────────────────────────────────────────────────
@router.post('/ask', response_model=ChatResponse)
async def ask(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(verify_internal_secret)
):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail='Question cannot be empty')

    if not request.document_ids:
        raise HTTPException(status_code=400, detail='No documents provided')

    # Step 1: Embed the question
    try:
        query_embedding = EmbeddingService.embed_query(request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Embedding failed: {str(e)}')

    # Step 2: Search for relevant chunks
    try:
        chunks = await SearchService.search_chunks(
            db=db,
            document_ids=request.document_ids,
            query_embedding=query_embedding,
            top_k=request.top_k
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Search failed: {str(e)}')

    if not chunks:
        return ChatResponse(
            answer="I couldn't find relevant information in the provided documents.",
            sources=[],
            chunks_used=0
        )

    # Step 3: Build context from chunks
    context = SearchService.build_context(chunks)

    # Step 4: Generate answer with Gemini
    try:
        answer = LLMService.generate_response(
            question=request.question,
            context=context,
            system_prompt=request.system_prompt,
            chat_history=request.chat_history,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Generation failed: {str(e)}')

    return ChatResponse(
        answer=answer,
        sources=[
            {
                'document_id': c['document_id'],
                'document_title': c['document_title'],
                'page_number': c['page_number'],
                'similarity': round(c['similarity'], 3),
                'content_preview': c['content'][:150] + '...'
            }
            for c in chunks
        ],
        chunks_used=len(chunks)
    )


# ── Health check ───────────────────────────────────────────────────
@router.get('/health')
async def health():
    return {'status': 'ok', 'service': 'fastapi-ai'}