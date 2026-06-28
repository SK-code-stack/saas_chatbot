from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.chat import router as chat_router

app = FastAPI(
    title='SaaS Chatbot AI Service',
    version='1.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(chat_router, prefix='/chat', tags=['chat'])


@app.get('/')
async def root():
    return {'message': 'FastAPI AI Service running'}