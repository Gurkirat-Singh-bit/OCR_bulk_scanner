# 1-10: Import modules
import os
import base64
import requests
import json
from dotenv import load_dotenv
from PIL import Image, ImageOps
from io import BytesIO
from app.mongo import add_extraction_record, load_extraction_data, update_extraction_record, delete_extraction_record

# 11-20: Load environment variables and country mapping
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# Country to flag mapping
COUNTRY_FLAGS = {
    'afghanistan': '🇦🇫', 'albania': '🇦🇱', 'algeria': '🇩🇿', 'argentina': '🇦🇷', 'armenia': '🇦🇲',
    'australia': '🇦🇺', 'austria': '🇦🇹', 'azerbaijan': '🇦🇿', 'bangladesh': '🇧🇩', 'belgium': '🇧🇪',
    'brazil': '🇧🇷', 'bulgaria': '🇧🇬', 'canada': '🇨🇦', 'chile': '🇨🇱', 'china': '🇨🇳',
    'colombia': '🇨🇴', 'croatia': '🇭🇷', 'czech republic': '🇨🇿', 'denmark': '🇩🇰', 'egypt': '🇪🇬',
    'finland': '🇫🇮', 'france': '🇫🇷', 'germany': '🇩🇪', 'greece': '🇬🇷', 'india': '🇮🇳',
    'indonesia': '🇮🇩', 'iran': '🇮🇷', 'ireland': '🇮🇪', 'israel': '🇮🇱', 'italy': '🇮🇹',
    'japan': '🇯🇵', 'kazakhstan': '🇰🇿', 'malaysia': '🇲🇾', 'mexico': '🇲🇽', 'netherlands': '🇳🇱',
    'nigeria': '🇳🇬', 'norway': '🇳🇴', 'pakistan': '🇵🇰', 'poland': '🇵🇱', 'portugal': '🇵🇹',
    'romania': '🇷🇴', 'russia': '🇷🇺', 'singapore': '🇸🇬', 'south korea': '🇰🇷', 'spain': '🇪🇸',
    'sweden': '🇸🇪', 'switzerland': '🇨🇭', 'turkey': '🇹🇷', 'ukraine': '🇺🇦', 
    'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'britain': '🇬🇧', 'england': '🇬🇧',
    'united states': '🇺🇸', 'usa': '🇺🇸', 'us': '🇺🇸', 'america': '🇺🇸'
}

def get_country_flag(country_name):
    """Get flag emoji for a country name"""
    if not country_name:
        return '🌍'
    
    # Try exact match first
    country_lower = country_name.lower().strip()
    if country_lower in COUNTRY_FLAGS:
        return COUNTRY_FLAGS[country_lower]
    
    # Try partial matches
    for country, flag in COUNTRY_FLAGS.items():
        if country in country_lower or country_lower in country:
            return COUNTRY_FLAGS[country]
    
    return '🌍'  # Default flag

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
                    {"text": "Extract information from this visiting card and return only JSON with these fields: name, phone, email, company, country. For country, detect from address, phone number format, or any country indicators in the text. If no country is detectable, leave it empty."},
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
        extracted_country = data.get("country", "").strip()
        
        # Get flag for the country
        flag = get_country_flag(extracted_country)
        
        result_data = {
            "name": data.get("name", "").strip(),
            "phone": data.get("phone", "").strip(), 
            "email": data.get("email", "").strip(),
            "company": data.get("company", "").strip(),
            "country": extracted_country,
            "flag": flag
        }
        
        return result_data
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"Raw text was: {text}")
        return {"name": "", "phone": "", "email": "", "company": "", "country": "", "flag": "🌍"}
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return {"name": "", "phone": "", "email": "", "company": "", "country": "", "flag": "🌍"}

# 61-100: MongoDB data persistence functions (imported from mongo.py)
# All data persistence functions are now imported from app.mongo module:
# - add_extraction_record(record) 
# - load_extraction_data()
# - update_extraction_record(record_id, updated_record)
# - delete_extraction_record(record_id)

# These functions now store data in MongoDB instead of local JSON files
# No local file storage is used - all data flows through MongoDB
