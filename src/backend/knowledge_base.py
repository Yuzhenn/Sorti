from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List


@dataclass
class KnowledgeChunk:
    page_content: str
    metadata: Dict[str, Any]


PROJECT_ROOT = Path(__file__).resolve().parents[2]
KONDO_RULES_PATH = PROJECT_ROOT / "kondo_rules.txt"


def _split_text(text: str, chunk_size: int, chunk_overlap: int, separators: List[str]) -> List[str]:
    """用純 Python 方式切段，避免依賴容易受環境限制的 LangChain splitter。"""

    if chunk_size <= 0:
        raise ValueError("chunk_size 必須大於 0")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap 不能小於 0")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap 必須小於 chunk_size")

    chunks: List[str] = []
    remaining_text = text.strip()

    while remaining_text:
        if len(remaining_text) <= chunk_size:
            chunks.append(remaining_text)
            break

        split_at = -1
        split_sep = ""
        for separator in separators:
            search_limit = min(len(remaining_text), chunk_size) + 1
            candidate = remaining_text.rfind(separator, 0, search_limit)
            if candidate > split_at:
                split_at = candidate
                split_sep = separator

        if split_at <= 0:
            split_at = chunk_size
            split_sep = ""

        chunk = remaining_text[:split_at].strip()
        if chunk:
            chunks.append(chunk)

        next_start = split_at + len(split_sep) - chunk_overlap
        if next_start <= 0:
            next_start = split_at + len(split_sep)
        remaining_text = remaining_text[max(next_start, 0):].lstrip()

    return chunks


@lru_cache(maxsize=1)
def load_kondo_rules_text() -> str:
    """讀取怦然心動法則原始文本。"""

    if not KONDO_RULES_PATH.exists():
        raise FileNotFoundError(f"找不到知識庫檔案：{KONDO_RULES_PATH}")

    return KONDO_RULES_PATH.read_text(encoding="utf-8")


def build_kondo_documents(chunk_size: int = 900, chunk_overlap: int = 120) -> List[KnowledgeChunk]:
    """把原始規則切成適合檢索的文字片段。"""

    chunks = _split_text(
        load_kondo_rules_text(),
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "。", "；", "，", " "],
    )

    documents: List[KnowledgeChunk] = []
    for index, chunk in enumerate(chunks, start=1):
        documents.append(
            KnowledgeChunk(
                page_content=chunk.strip(),
                metadata={
                    "source": "kondo_rules.txt",
                    "title": f"怦然心動法則片段 {index}",
                    "chunk_index": index,
                },
            )
        )

    return documents


def format_documents(documents: List[KnowledgeChunk]) -> str:
    """把檢索到的文件整理成可直接放入 Prompt 的純文字。"""

    if not documents:
        return "尚未檢索到相關規則。"

    blocks = []
    for index, document in enumerate(documents, start=1):
        title = document.metadata.get("title", f"片段 {index}")
        blocks.append(f"【{title}】\n{document.page_content.strip()}")

    return "\n\n".join(blocks)