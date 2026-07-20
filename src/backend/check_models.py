import os
import google.generativeai as genai
from dotenv import load_dotenv

# 讀取 .env 檔案中的 GOOGLE_API_KEY
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ 找不到 GOOGLE_API_KEY，請確認 .env 檔案設定是否正確！")
else:
    genai.configure(api_key=api_key)
    print("=== 您的 API 金鑰支援的模型列表 ===")
    try:
        # 列出所有支援生成內容的模型
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print("❌ API 金鑰驗證失敗或網路有問題：", e)