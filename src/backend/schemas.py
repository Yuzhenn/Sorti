from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


AIRequestMode = Literal["chat", "photo_analysis"]


class ChatRequest(BaseModel):
    message: str
    user_persona: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    items: List[Dict[str, Any]] = Field(default_factory=list)

    # chat：一般聊天
    # photo_analysis：照片辨識後的收納分析
    mode: AIRequestMode = "chat"


class ChatResponse(BaseModel):
    reply: str
    retrieved_titles: List[str] = Field(default_factory=list)


class DetectedItem(BaseModel):
    name: str
    category: str
    count: int
    confidence: Optional[float] = None
    raw_label: Optional[str] = None


class DetectionBox(BaseModel):
    name: str
    category: str
    confidence: Optional[float] = None
    raw_label: Optional[str] = None
    x: float
    y: float
    width: float
    height: float


class DetectItemsResponse(BaseModel):
    detected_items: List[DetectedItem] = Field(default_factory=list)
    detection_boxes: List[DetectionBox] = Field(default_factory=list)
    total_detections: int
    model_name: str