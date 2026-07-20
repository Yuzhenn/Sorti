import os

# 為了避免「GOOGLE_API_KEY 與 GEMINI_API_KEY 同時存在」的警告：
# 若已設定 GEMINI_API_KEY，就不要額外塞 GOOGLE_API_KEY。
if os.getenv("GEMINI_API_KEY"):
    os.environ.pop("GOOGLE_API_KEY", None)

from rag_service import answer_question

# 模擬 YOLOv11 辨識出的物品清單
mock_detected_items = [
    {"name": "穿到起毛球的 T恤", "category": "衣服", "count": 3},
    {"name": "未拆封的過期化妝品試用包", "category": "小東西", "count": 10},
    {"name": "沒看過的統計學原文書", "category": "書籍", "count": 1}
]

def run_test():
    print("✅ test_local.py 已經成功啟動！")
    print("=== 開始 RAG 測試 ===")
    print("正在建立向量資料庫並呼叫 Gemini...\n")
    
    try:
        # 呼叫 RAG 服務
        response = answer_question(
            question="我的桌子跟床上堆滿了這些東西，我都捨不得丟，不知道該從哪裡開始整理，救救我！",
            detected_items=mock_detected_items,
            user_persona="首席秩序官",  # 測試時可以換成「視覺幻術師」等其他人格看看差異
            top_k=4
        )

        print("✨ 【AI 收納導師回覆】 ✨\n")
        print(response["reply"])
        print("\n-------------------------")
        print("🔍 【底層檢索到的 RAG 知識片段】 🔍")
        for title in response["retrieved_titles"]:
            print(f"- {title}")
            
    except Exception as e:
        print(f"❌ 測試過程中發生錯誤: {e}")

if __name__ == "__main__":
    run_test()