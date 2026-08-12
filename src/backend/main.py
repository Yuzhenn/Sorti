from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


BACKEND_DIR = Path(__file__).resolve().parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


from detection_service import detect_items
from rag_service import answer_question
from schemas import ChatRequest, ChatResponse, DetectItemsResponse


app = FastAPI(title="Sorti LLM RAG Chatbot API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Sorti AI Chatbot API is running",
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """
    一般聊天與照片分析共用此端點。

    - mode="chat"：使用聊天機器人 Prompt
    - mode="photo_analysis"：使用照片分析 Prompt
    """
    try:
        # 優先使用直接傳入的人格。
        # 若舊版前端仍傳 user_profile，則保留相容處理。
        user_persona = req.user_persona

        if not user_persona and req.user_profile:
            user_persona = (
                req.user_profile.get("personality_type")
                or req.user_profile.get("personality_desc")
            )

        result = answer_question(
            question=req.message,
            detected_items=req.items,
            user_persona=user_persona,
            mode=req.mode,
        )

        return ChatResponse(
            reply=result["reply"],
            retrieved_titles=result.get("retrieved_titles", []),
        )

    except Exception as error:
        print("Chat API 發生錯誤：", error)
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@app.post("/detect-items", response_model=DetectItemsResponse)
async def detect_uploaded_items(
    image: UploadFile = File(...),
) -> DetectItemsResponse:
    temp_path: str | None = None

    try:
        suffix = Path(image.filename or "").suffix or ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:
            temp_file.write(await image.read())
            temp_path = temp_file.name

        result = detect_items(temp_path)

        return DetectItemsResponse(**result)

    except Exception as error:
        print("Detect API 發生錯誤：", error)
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass