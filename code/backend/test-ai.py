#!/usr/bin/env python3
import json
import urllib.request
import urllib.error

BASE_URL = "https://rtls3su.abc-tunnel.us/v1"
API_KEY = "sk-217cd9c2ec115af2-79wa3f-2ef5c412"

def make_request(url, headers, data=None):
    req = urllib.request.Request(url, headers=headers, method="POST" if data else "GET")
    if data:
        req.data = json.dumps(data).encode("utf-8")
    
    try:
        with urllib.request.urlopen(req) as response:
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
            err_json = json.loads(body)
            return e.code, err_json
        except Exception:
            return e.code, body
    except Exception as e:
        return 0, str(e)

import base64
from pathlib import Path

IMAGE_PATH = "/Users/doando/Documents/medicore/MediCore_v2/code/frontend/public/images/doctor-chen.png"

def get_image_base64(path):
    with open(path, "rb") as image_file:
        encoded = base64.b64encode(image_file.read()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

def main():
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    model = "cx/gpt-5.5"
    print(f"Using vision model: '{model}'")

    print(f"\nStep 1: Encoding image '{IMAGE_PATH}' to base64...")
    try:
        image_base64 = get_image_base64(IMAGE_PATH)
        print("Image encoded successfully.")
    except Exception as e:
        print(f"Failed to encode image: {e}")
        return

    print("\nStep 2: Sending test chat completion request with text and image...")
    chat_payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Hãy cho biết người trong bức ảnh này làm nghề gì, mặc trang phục gì và có thái độ như thế nào? Trả lời ngắn gọn."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_base64
                        }
                    }
                ]
            }
        ],
        "temperature": 0.5
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
                print(f"Multimodal verification complete! Model '{model}' supports vision.")
        except Exception as e:
            print(f"Failed to parse successful chat response: {e}")
            print(json.dumps(chat_res, indent=2, ensure_ascii=False) if isinstance(chat_res, dict) else chat_res)
    else:
        print(f"Model '{model}' failed with status {status}. Error details:")
        print(json.dumps(chat_res, indent=2, ensure_ascii=False) if isinstance(chat_res, dict) else chat_res)

if __name__ == "__main__":
    main()
