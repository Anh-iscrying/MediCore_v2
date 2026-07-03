#!/usr/bin/env python3
import base64
import json
import os
import urllib.error
import urllib.request

BASE_URL = os.getenv("AI_GATEWAY_BASE_URL", "").rstrip("/")
API_KEY = os.getenv("AI_GATEWAY_API_KEY", "")
MODEL = os.getenv("AI_GATEWAY_MODEL", "cx/gpt-5.5")
IMAGE_PATH = os.getenv("AI_TEST_IMAGE_PATH")


def make_request(url, headers, data=None):
    req = urllib.request.Request(url, headers=headers, method="POST" if data else "GET")
    if data:
        req.data = json.dumps(data).encode("utf-8")

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            raw_body = response.read().decode("utf-8").strip()
            if raw_body.endswith("data: [DONE]"):
                raw_body = raw_body[:-12].strip()
            try:
                return response.status, json.loads(raw_body)
            except Exception as je:
                return response.status, f"JSON parse error: {je}\nRaw body:\n{raw_body}"
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body
    except Exception as e:
        return 0, str(e)


def get_image_base64(path):
    with open(path, "rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"


def build_user_content():
    if not IMAGE_PATH:
        return "Tôi bị đau đầu nhẹ từ sáng nay, không sốt. Tôi nên theo dõi gì và khi nào cần đi khám? Trả lời ngắn gọn bằng tiếng Việt."

    print(f"\nStep 1: Encoding image '{IMAGE_PATH}' to base64...")
    image_base64 = get_image_base64(IMAGE_PATH)
    print("Image encoded successfully.")

    return [
        {
            "type": "text",
            "text": "Hãy cho biết người trong bức ảnh này làm nghề gì, mặc trang phục gì và có thái độ như thế nào? Trả lời ngắn gọn.",
        },
        {
            "type": "image_url",
            "image_url": {
                "url": image_base64,
            },
        },
    ]


def main():
    if not BASE_URL or not API_KEY:
        print("Missing AI_GATEWAY_BASE_URL or AI_GATEWAY_API_KEY")
        return

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MediCore-Test/1.0",
    }

    print(f"Using model: '{MODEL}'")
    if IMAGE_PATH:
        print("AI_TEST_IMAGE_PATH detected; sending multimodal request.")
    else:
        print("AI_TEST_IMAGE_PATH not set; sending text-only request.")

    try:
        content = build_user_content()
    except Exception as e:
        print(f"Failed to prepare request content: {e}")
        return

    print("\nSending chat completion request...")
    chat_payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": content,
            }
        ],
        "temperature": 0.5,
    }

    status, chat_res = make_request(f"{BASE_URL}/chat/completions", headers, chat_payload)
    print(f"Chat status response: {status}")

    if status == 200:
        try:
            if isinstance(chat_res, str) and "JSON parse error" in chat_res:
                print(chat_res)
            else:
                reply = chat_res["choices"][0]["message"]["content"]
                print("\n=== SUCCESS: AI RESPONSE ===")
                print(reply)
                print("============================\n")
        except Exception as e:
            print(f"Failed to parse successful chat response: {e}")
            print(json.dumps(chat_res, indent=2, ensure_ascii=False) if isinstance(chat_res, dict) else chat_res)
    else:
        print(f"Model '{MODEL}' failed with status {status}. Error details:")
        print(json.dumps(chat_res, indent=2, ensure_ascii=False) if isinstance(chat_res, dict) else chat_res)


if __name__ == "__main__":
    main()
