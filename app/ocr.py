# 1-10: Import modules
import os
import base64
import requests
import json
from dotenv import load_dotenv
from PIL import Image, ImageOps
from io import BytesIO

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

# 61-120: Data persistence functions for JSON storage
def get_data_file_path():
    """Get the absolute path to data.json file"""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(project_root, 'static', 'results', 'data.json')

def load_extraction_data():
    """Load all extraction data from JSON file"""
    data_file = get_data_file_path()
    try:
        if os.path.exists(data_file):
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return []

def save_extraction_data(data_list):
    """Save extraction data to JSON file"""
    data_file = get_data_file_path()
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(data_file), exist_ok=True)
        
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data_list, f, indent=2, ensure_ascii=False)
        print(f"✅ Data saved to {data_file}")
        return True
    except Exception as e:
        print(f"❌ Error saving data: {e}")
        return False

def add_extraction_record(record):
    """Add a new extraction record to the data file"""
    data = load_extraction_data()
    
    # Add unique ID and timestamp
    import time
    record['id'] = int(time.time() * 1000)  # Unique timestamp ID
    record['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
    
    data.append(record)
    save_extraction_data(data)
    return record['id']

def update_extraction_record(record_id, updated_record):
    """Update an existing extraction record"""
    data = load_extraction_data()
    
    for i, record in enumerate(data):
        if record.get('id') == record_id:
            # Keep original ID and timestamp
            updated_record['id'] = record['id']
            updated_record['timestamp'] = record['timestamp']
            data[i] = updated_record
            save_extraction_data(data)
            return True
    return False

def delete_extraction_record(record_id):
    """Delete an extraction record"""
    data = load_extraction_data()
    
    for i, record in enumerate(data):
        if record.get('id') == record_id:
            del data[i]
            save_extraction_data(data)
            return True
    return False
