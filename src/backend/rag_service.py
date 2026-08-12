from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
import math
import os
import re
from typing import Any, Dict, List, Literal

from dotenv import load_dotenv
from google import genai

from knowledge_base import (
    KnowledgeChunk,
    build_kondo_documents,
    format_documents,
)
from prompts import (
    build_direct_answer_prompt,
    build_photo_analysis_prompt,
    build_step_instruction_prompt,
    describe_persona,
    persona_response_focus,
)


load_dotenv()


AIRequestMode = Literal["chat", "photo_analysis"]


DEFAULT_GEMINI_CANDIDATES = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
    "gemini-2.5-flash",
]


@dataclass(frozen=True)
class _ScoredChunk:
    chunk: KnowledgeChunk
    score: float


def _tokenize(text: str) -> List[str]:
    tokens: List[str] = []

    for chinese_part in re.findall(r"[\u4e00-\u9fff]+", text):
        if len(chinese_part) == 1:
            tokens.append(chinese_part)
        else:
            tokens.extend(
                chinese_part[index : index + 2]
                for index in range(len(chinese_part) - 1)
            )

    tokens.extend(
        part.lower()
        for part in re.findall(r"[A-Za-z0-9]+", text)
    )

    return tokens


def _score_chunk(
    question_terms: Counter[str],
    chunk_terms: Counter[str],
    document_frequency: Counter[str],
    total_documents: int,
) -> float:
    score = 0.0

    for term, question_count in question_terms.items():
        chunk_count = chunk_terms.get(term)

        if not chunk_count:
            continue

        idf = (
            math.log(
                (total_documents + 1)
                / (document_frequency[term] + 1)
            )
            + 1.0
        )

        score += question_count * chunk_count * idf

    return score


class _SimpleRetriever:
    def __init__(
        self,
        knowledge_base: "_SimpleKnowledgeBase",
        top_k: int,
    ):
        self._knowledge_base = knowledge_base
        self._top_k = top_k

    def invoke(self, question: str) -> List[KnowledgeChunk]:
        return [
            item.chunk
            for item in self._knowledge_base.similarity_search_with_score(
                question,
                k=self._top_k,
            )
        ]


class _SimpleKnowledgeBase:
    def __init__(self, documents: List[KnowledgeChunk]):
        self._documents = documents
        self._document_terms: List[Counter[str]] = []
        self._document_frequency: Counter[str] = Counter()

        for document in documents:
            terms = Counter(
                _tokenize(
                    f"{document.metadata.get('title', '')} "
                    f"{document.page_content}"
                )
            )

            self._document_terms.append(terms)
            self._document_frequency.update(terms.keys())

    def similarity_search_with_score(
        self,
        question: str,
        k: int = 4,
    ) -> List[_ScoredChunk]:
        question_terms = Counter(_tokenize(question))

        if not question_terms:
            return [
                _ScoredChunk(chunk=document, score=0.0)
                for document in self._documents[:k]
            ]

        scored_documents = [
            _ScoredChunk(
                chunk=document,
                score=_score_chunk(
                    question_terms,
                    document_terms,
                    self._document_frequency,
                    len(self._documents),
                ),
            )
            for document, document_terms in zip(
                self._documents,
                self._document_terms,
            )
        ]

        scored_documents.sort(
            key=lambda item: item.score,
            reverse=True,
        )

        return scored_documents[:k]

    def as_retriever(
        self,
        search_kwargs: Dict[str, Any] | None = None,
    ) -> _SimpleRetriever:
        top_k = (search_kwargs or {}).get("k", 4)
        return _SimpleRetriever(self, top_k)


@lru_cache(maxsize=1)
def get_vectorstore() -> _SimpleKnowledgeBase:
    return _SimpleKnowledgeBase(build_kondo_documents())


def get_retriever(top_k: int = 4) -> _SimpleRetriever:
    return get_vectorstore().as_retriever(
        search_kwargs={"k": top_k},
    )


def retrieve_knowledge(
    question: str,
    top_k: int = 4,
) -> List[Dict[str, Any]]:
    scored_documents = (
        get_vectorstore().similarity_search_with_score(
            question,
            k=top_k,
        )
    )

    result: List[Dict[str, Any]] = []

    for index, scored_document in enumerate(
        scored_documents,
        start=1,
    ):
        document = scored_document.chunk

        result.append(
            {
                "title": document.metadata.get(
                    "title",
                    f"片段 {index}",
                ),
                "content": document.page_content,
                "score": float(scored_document.score),
            }
        )

    return result


def _format_detected_items(
    detected_items: List[Dict[str, Any]] | None,
) -> str:
    if not detected_items:
        return "目前沒有提供偵測到的物品清單。"

    lines: List[str] = []

    for index, item in enumerate(
        detected_items,
        start=1,
    ):
        item_name = (
            item.get("name")
            or item.get("label")
            or item.get("item")
            or "未命名物品"
        )
        category = item.get("category") or "未分類"
        count = item.get("count", 1)
        confidence = item.get("confidence")

        confidence_text = ""

        if isinstance(confidence, (int, float)):
            confidence_text = f"，信心值：{confidence:.2f}"

        lines.append(
            f"{index}. {item_name}"
            f"｜類別：{category}"
            f"｜數量：{count}"
            f"{confidence_text}"
        )

    return "\n".join(lines)


def _normalize_chat_reply_text(text: str) -> str:
    """
    清理一般聊天回答。

    一般聊天不依賴 Markdown 標題，因此可移除裝飾符號。
    """
    normalized_lines: List[str] = []

    for line in (text or "").splitlines():
        cleaned_line = re.sub(r'[\*#>"]', "", line)
        cleaned_line = re.sub(
            r"\s+",
            " ",
            cleaned_line,
        ).strip()

        if cleaned_line:
            normalized_lines.append(cleaned_line)

    return "\n".join(normalized_lines).strip()


def _normalize_photo_reply_text(text: str) -> str:
    """
    清理照片分析回答，但保留 Markdown 標題與項目符號。

    前端會依據「### 建議採購」解析採購項目，
    因此不能刪除 #、- 等格式符號。
    """
    normalized_lines: List[str] = []

    for line in (text or "").splitlines():
        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        # 移除模型偶爾加上的程式碼區塊標記。
        if cleaned_line.startswith("```"):
            continue

        # 僅壓縮行內多餘空白，不破壞 Markdown 結構。
        cleaned_line = re.sub(
            r"[ \t]+",
            " ",
            cleaned_line,
        )

        normalized_lines.append(cleaned_line)

    return "\n".join(normalized_lines).strip()


def _is_organizing_question(question: str) -> bool:
    """判斷一般聊天問題是否屬於收納整理類意圖。"""
    normalized_question = (question or "").strip()

    if not normalized_question:
        return False

    organizing_keywords = [
        "整理",
        "收納",
        "怎麼清",
        "斷捨離",
        "分類",
        "歸位",
        "擺放",
        "放哪裡",
        "怎麼放",
        "怎麼收",
        "丟掉",
        "留著",
        "起手式",
        "開始整理",
        "房間亂",
        "桌面亂",
        "衣櫃",
        "抽屜",
        "櫃子",
        "清單",
    ]

    return any(
        keyword in normalized_question
        for keyword in organizing_keywords
    )


def _answer_with_model_fallback(
    prompt_value: str,
    api_key: str,
    *,
    mode: AIRequestMode = "chat",
    max_output_tokens: int = 2000,
    temperature: float = 0.35,
) -> str:
    preferred_model = os.getenv(
        "GEMINI_MODEL",
        "",
    ).strip()

    models = [
        model
        for model in (
            [preferred_model]
            + DEFAULT_GEMINI_CANDIDATES
        )
        if model
    ]

    unique_models = list(dict.fromkeys(models))
    last_error: Exception | None = None

    for model_name in unique_models:
        try:
            client = genai.Client(api_key=api_key)
            from google.genai import types

            response = client.models.generate_content(
                model=model_name,
                contents=prompt_value,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                ),
            )

            raw_reply = (
                getattr(response, "text", None)
                or getattr(response, "content", None)
                or str(response)
            )

            if mode == "photo_analysis":
                return _normalize_photo_reply_text(
                    str(raw_reply),
                )

            return _normalize_chat_reply_text(
                str(raw_reply),
            )

        except Exception as error:
            last_error = error
            error_text = str(error)

            retryable_model_errors = [
                "NOT_FOUND",
                "RESOURCE_EXHAUSTED",
                "PERMISSION_DENIED",
                "UNAVAILABLE",
            ]

            if not any(
                token in error_text
                for token in retryable_model_errors
            ):
                raise

    raise RuntimeError(
        "所有候選 Gemini 模型皆不可用，"
        f"最後錯誤：{last_error}"
    )


def _generate_chat_answer(
    bundle: Dict[str, Any],
    api_key: str,
) -> str:
    """一般聊天模式：依問題意圖選擇步驟教學或簡答 Prompt。"""
    is_organizing = _is_organizing_question(
        bundle["question"],
    )

    if is_organizing:
        prompt_value = build_step_instruction_prompt(
            bundle,
        )
    else:
        prompt_value = build_direct_answer_prompt(
            bundle,
        )

    return _answer_with_model_fallback(
        prompt_value,
        api_key,
        mode="chat",
        max_output_tokens=2000,
        temperature=0.35,
    )


def _generate_photo_analysis_answer(
    detected_items_text: str,
    api_key: str,
) -> str:
    """
    照片分析模式：只使用照片分析 Prompt。

    不套用聊天人格、不加入延伸問題，也不做一般聊天意圖判斷。
    """
    print("目前使用：PHOTO_ANALYSIS_SYSTEM_PROMPT")

    prompt_value = build_photo_analysis_prompt(
        {
            "detected_items": detected_items_text,
        }
    )

    return _answer_with_model_fallback(
        prompt_value,
        api_key,
        mode="photo_analysis",
        max_output_tokens=700,
        temperature=0.2,
    )


def _build_chat_bundle(
    inputs: Dict[str, Any],
    top_k: int,
) -> Dict[str, Any]:
    retriever = get_retriever(top_k)

    retrieved_documents = retriever.invoke(
        inputs["question"],
    )

    return {
        "question": inputs["question"],
        "user_persona": inputs["user_persona"],
        "persona_focus": persona_response_focus(
            inputs["user_persona"],
        ),
        "detected_items": inputs["detected_items"],
        "context": format_documents(
            retrieved_documents,
        ),
        "retrieved_titles": [
            document.metadata.get(
                "title",
                f"片段 {index}",
            )
            for index, document in enumerate(
                retrieved_documents,
                start=1,
            )
        ],
    }


def _get_api_key() -> str:
    api_key = (
        os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )

    if not api_key:
        raise ValueError(
            "找不到 GOOGLE_API_KEY 或 GEMINI_API_KEY，"
            "請確認環境變數或 backend/.env。"
        )

    return api_key


def get_answer_chain(
    top_k: int = 4,
    mode: AIRequestMode = "chat",
):
    """
    建立回答鏈。

    保留這個函式供舊程式使用，但新增 mode 支援。
    """
    api_key = _get_api_key()

    class _Chain:
        def invoke(
            self,
            payload: Dict[str, Any],
        ) -> Dict[str, Any]:
            if mode == "photo_analysis":
                reply = _generate_photo_analysis_answer(
                    payload["detected_items"],
                    api_key,
                )

                return {
                    "reply": reply,
                    "retrieved_titles": [],
                }

            bundle = _build_chat_bundle(
                payload,
                top_k,
            )

            return {
                "reply": _generate_chat_answer(
                    bundle,
                    api_key,
                ),
                "retrieved_titles": bundle[
                    "retrieved_titles"
                ],
            }

    return _Chain()


def answer_question(
    question: str,
    detected_items: List[Dict[str, Any]] | None = None,
    user_persona: str | None = None,
    top_k: int = 4,
    mode: AIRequestMode = "chat",
) -> Dict[str, Any]:
    """
    統一回答入口。

    mode="chat"
        使用人格、RAG 知識庫、步驟或簡答 Prompt。

    mode="photo_analysis"
        只使用照片分析 Prompt，並由 AI 根據整理方法推斷採購用品。
    """
    normalized_mode: AIRequestMode = (
        "photo_analysis"
        if mode == "photo_analysis"
        else "chat"
    )

    formatted_items = _format_detected_items(
        detected_items,
    )

    print("rag_service 收到的 mode：", mode)
    print("正規化後的 mode：", normalized_mode)

    # 照片分析不需要檢索聊天知識庫，也不套用人格 Prompt。
    if normalized_mode == "photo_analysis":
        api_key = _get_api_key()

        return {
            "reply": _generate_photo_analysis_answer(
                formatted_items,
                api_key,
            ),
            "retrieved_titles": [],
        }

    chain = get_answer_chain(
        top_k=top_k,
        mode="chat",
    )

    payload = {
        "question": question,
        "detected_items": formatted_items,
        "user_persona": describe_persona(
            user_persona,
        ),
        "context": "",
    }

    return chain.invoke(payload)