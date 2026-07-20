from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    user_persona: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    items: List[Dict[str, Any]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    retrieved_titles: List[str]