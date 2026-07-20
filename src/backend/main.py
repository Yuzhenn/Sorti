from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from rag_service import answer_question
from schemas import ChatRequest, ChatResponse

app = FastAPI(title="Sorti LLM RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "ok",
        "message": "Sorti AI Chatbot API is running"
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        # 優先使用直接傳入的人格，若前端還是傳 user_profile，則做相容處理。
        user_persona = req.user_persona
        if not user_persona and req.user_profile:
            user_persona = req.user_profile.get("personality_type") or req.user_profile.get("personality_desc")

        result = answer_question(
            question=req.message,
            detected_items=req.items,
            user_persona=user_persona,
        )

        return ChatResponse(
            reply=result["reply"],
            retrieved_titles=result["retrieved_titles"],
        )

    except Exception as e:
        print("Chat API 發生錯誤：", e)
        raise HTTPException(status_code=500, detail=str(e))