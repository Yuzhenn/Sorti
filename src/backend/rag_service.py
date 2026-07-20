from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import math
import os
from functools import lru_cache
import re
from typing import Any, Dict, List

from dotenv import load_dotenv

from google import genai

from knowledge_base import KnowledgeChunk, build_kondo_documents, format_documents
from prompts import build_prompt_template, describe_persona

load_dotenv()

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
    """把中文與英數內容拆成簡單可比對的詞元。"""

    tokens: List[str] = []

    for chinese_part in re.findall(r"[\u4e00-\u9fff]+", text):
        if len(chinese_part) == 1:
            tokens.append(chinese_part)
        else:
            tokens.extend(chinese_part[index : index + 2] for index in range(len(chinese_part) - 1))

    tokens.extend(part.lower() for part in re.findall(r"[A-Za-z0-9]+", text))
    return tokens


def _score_chunk(question_terms: Counter[str], chunk_terms: Counter[str], document_frequency: Counter[str], total_documents: int) -> float:
    """用簡單的 TF-IDF 風格分數做相關性排序。"""

    score = 0.0
    for term, question_count in question_terms.items():
        chunk_count = chunk_terms.get(term)
        if not chunk_count:
            continue

        idf = math.log((total_documents + 1) / (document_frequency[term] + 1)) + 1.0
        score += question_count * chunk_count * idf

    return score


class _SimpleRetriever:
    def __init__(self, knowledge_base: "_SimpleKnowledgeBase", top_k: int):
        self._knowledge_base = knowledge_base
        self._top_k = top_k

    def invoke(self, question: str) -> List[KnowledgeChunk]:
        return [item.chunk for item in self._knowledge_base.similarity_search_with_score(question, k=self._top_k)]


class _SimpleKnowledgeBase:
    def __init__(self, documents: List[KnowledgeChunk]):
        self._documents = documents
        self._document_terms = []
        self._document_frequency: Counter[str] = Counter()

        for document in documents:
            terms = Counter(_tokenize(f"{document.metadata.get('title', '')} {document.page_content}"))
            self._document_terms.append(terms)
            self._document_frequency.update(terms.keys())

    def similarity_search_with_score(self, question: str, k: int = 4) -> List[_ScoredChunk]:
        question_terms = Counter(_tokenize(question))
        if not question_terms:
            return [_ScoredChunk(chunk=document, score=0.0) for document in self._documents[:k]]

        scored_documents = [
            _ScoredChunk(
                chunk=document,
                score=_score_chunk(question_terms, document_terms, self._document_frequency, len(self._documents)),
            )
            for document, document_terms in zip(self._documents, self._document_terms)
        ]

        scored_documents.sort(key=lambda item: item.score, reverse=True)
        return scored_documents[:k]

    def as_retriever(self, search_kwargs: Dict[str, Any] | None = None):
        top_k = (search_kwargs or {}).get("k", 4)
        return _SimpleRetriever(self, top_k)


@lru_cache(maxsize=1)
def get_vectorstore():
    """初始化純 Python 知識庫。"""

    return _SimpleKnowledgeBase(build_kondo_documents())


def get_retriever(top_k: int = 4):
    """取得可重複使用的 Retriever。"""

    return get_vectorstore().as_retriever(search_kwargs={"k": top_k})


def retrieve_knowledge(question: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """保留舊介面，回傳最相關的法則片段摘要。"""

    scored_documents = get_vectorstore().similarity_search_with_score(question, k=top_k)

    result: List[Dict[str, Any]] = []
    for index, scored_document in enumerate(scored_documents, start=1):
        document = scored_document.chunk
        score = scored_document.score
        result.append(
            {
                "title": document.metadata.get("title", f"片段 {index}"),
                "content": document.page_content,
                "score": float(score),
            }
        )

    return result


def _format_detected_items(detected_items: List[Dict[str, Any]] | None) -> str:
    """把視覺辨識結果整理成 Prompt 友善格式。"""

    if not detected_items:
        return "目前沒有提供偵測到的物品清單。"

    lines: List[str] = []
    for index, item in enumerate(detected_items, start=1):
        item_name = item.get("name") or item.get("label") or item.get("item") or "未命名物品"
        category = item.get("category") or "未分類"
        count = item.get("count", 1)
        confidence = item.get("confidence")

        confidence_text = ""
        if isinstance(confidence, (int, float)):
            confidence_text = f"，信心值：{confidence:.2f}"

        lines.append(f"{index}. {item_name}｜類別：{category}｜數量：{count}{confidence_text}")

    return "\n".join(lines)


def _answer_with_model_fallback(prompt_value, api_key: str) -> str:
    """當特定 Gemini 模型不可用時，依序嘗試其他候選模型。"""

    preferred_model = os.getenv("GEMINI_MODEL", "").strip()
    models = [model for model in ([preferred_model] + DEFAULT_GEMINI_CANDIDATES) if model]

    # 去重但保留順序
    unique_models = list(dict.fromkeys(models))

    last_error: Exception | None = None
    for model_name in unique_models:
        try:
            client = genai.Client(api_key=api_key)
            from google.genai import types

            response = client.models.generate_content(
                model=model_name,
                contents=prompt_value,
                config=types.GenerateContentConfig(temperature=0.35),
            )
            return getattr(response, "text", None) or getattr(response, "content", None) or str(response)
        except Exception as error:  # pragma: no cover - 依實際雲端狀態而定
            last_error = error
            error_text = str(error)
            retryable_model_errors = [
                "NOT_FOUND",
                "RESOURCE_EXHAUSTED",
                "PERMISSION_DENIED",
                "UNAVAILABLE",
            ]
            if not any(token in error_text for token in retryable_model_errors):
                raise

    raise RuntimeError(f"所有候選 Gemini 模型皆不可用，最後錯誤：{last_error}")


def _build_bundle(inputs: Dict[str, Any], top_k: int) -> Dict[str, Any]:
    """先檢索，再把內容整理成可餵給 Prompt 的 bundle。"""

    retriever = get_retriever(top_k)
    retrieved_documents = retriever.invoke(inputs["question"])

    return {
        "question": inputs["question"],
        "user_persona": inputs["user_persona"],
        "detected_items": inputs["detected_items"],
        "context": format_documents(retrieved_documents),
        "retrieved_titles": [
            document.metadata.get("title", f"片段 {index}")
            for index, document in enumerate(retrieved_documents, start=1)
        ],
    }


def get_answer_chain(top_k: int = 4):
    """回傳一個相容舊介面的 callable，內部使用純 Python 流程。"""

    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("找不到 GOOGLE_API_KEY 或 GEMINI_API_KEY，請確認環境變數或 backend/.env。")

    class _Chain:
        def invoke(self, payload: Dict[str, Any]) -> Dict[str, Any]:
            bundle = _build_bundle(payload, top_k)
            prompt_value = build_prompt_template(
                {
                    "question": bundle["question"],
                    "user_persona": bundle["user_persona"],
                    "detected_items": bundle["detected_items"],
                    "context": bundle["context"],
                }
            )
            return {
                "reply": _answer_with_model_fallback(prompt_value, api_key),
                "retrieved_titles": bundle["retrieved_titles"],
            }

    return _Chain()


def answer_question(
    question: str,
    detected_items: List[Dict[str, Any]] | None = None,
    user_persona: str | None = None,
    top_k: int = 4,
) -> Dict[str, Any]:
    """對外輸出的主入口，回傳回答與檢索命中的標題。"""

    chain = get_answer_chain(top_k)
    payload = {
        "question": question,
        "detected_items": _format_detected_items(detected_items),
        "user_persona": describe_persona(user_persona),
        "context": "",
    }

    return chain.invoke(payload)