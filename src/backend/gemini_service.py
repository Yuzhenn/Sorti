import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("找不到 GEMINI_API_KEY，請確認 backend/.env 是否存在，且內容是否正確。")

genai.configure(api_key=api_key)


def generate_reply(prompt: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        if not response.text:
            return "AI 目前沒有產生回覆，請換個問題再試一次。"

        return response.text

    except Exception as e:
        print("Gemini API 發生錯誤：", e)
        raise e