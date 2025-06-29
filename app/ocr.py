# 1-10: Import modules
import os
import base64
import requests
import json
from dotenv import load_dotenv
from PIL import Image, ImageOps
from io import BytesIO
from app.mongo import add_extraction_record, load_extraction_data, update_extraction_record, delete_extraction_record

# 11-20: Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# 21-60: Gemini image extraction function
def extract_data_from_image_gemini(image_bytes):
    """
    21-60: Accepts image bytes, preprocesses, sends to Gemini API, returns structured data dict.
    """
    # 21-30: Preprocess image (resize, grayscale, contrast enhance)
    pil_img = Image.open(BytesIO(image_bytes)).convert('RGB')
    pil_img = ImageOps.exif_transpose(pil_img)  # Handle orientation
    pil_img = pil_img.resize((min(1200, pil_img.width), min(800, pil_img.height)), Image.LANCZOS)
    pil_img = ImageOps.grayscale(pil_img)
    pil_img = ImageOps.autocontrast(pil_img)
    
    # 31-40: Convert to base64
    buffered = BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode()

    # 41-50: Prepare Gemini API request
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Extract name, phone number, email, and company from this visiting card. Return only JSON with fields: name, phone, email, company."},
                    {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}}
                ]
            }
        ]
    }
    headers = {"Content-Type": "application/json"}

    # 51-60: Send request and parse response
    try:
        print(f"🔥 Sending request to Gemini API...")
        resp = requests.post(GEMINI_API_URL, headers=headers, data=json.dumps(payload), timeout=30)
        resp.raise_for_status()
        result = resp.json()
        print(f"📋 Raw Gemini response: {result}")
        
        # Parse Gemini's response for JSON content
        text = result['candidates'][0]['content']['parts'][0]['text']
        print(f"📝 Gemini text response: {text}")
        
        # Clean the text to extract JSON (remove markdown formatting if present)
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0].strip()
        elif '```' in text:
            text = text.split('```')[1].split('```')[0].strip()
        
        # Try to parse JSON
        data = json.loads(text)
        print(f"✅ Parsed data: {data}")
        
        # Ensure all required fields are present
        result_data = {
            "name": data.get("name", "").strip(),
            "phone": data.get("phone", "").strip(), 
            "email": data.get("email", "").strip(),
            "company": data.get("company", "").strip()
        }
        
        return result_data
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"Raw text was: {text}")
        return {"name": "", "phone": "", "email": "", "company": ""}
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return {"name": "", "phone": "", "email": "", "company": ""}

# 61-100: MongoDB data persistence functions (imported from mongo.py)
# All data persistence functions are now imported from app.mongo module:
# - add_extraction_record(record) 
# - load_extraction_data()
# - update_extraction_record(record_id, updated_record)
# - delete_extraction_record(record_id)

# These functions now store data in MongoDB instead of local JSON files
# No local file storage is used - all data flows through MongoDB
