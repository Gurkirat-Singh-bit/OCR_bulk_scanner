# 1-10: Importing modules
import pytesseract  # Tesseract OCR library for text extraction
import cv2  # OpenCV for image processing
import re  # Regular expressions for pattern matching
import numpy as np  # NumPy for array operations
from PIL import Image  # PIL for image handling

# 11-20: OCR configuration
# Configure Tesseract path if needed (uncomment and modify for Windows)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_path):
    """
    21-40: Image preprocessing function to improve OCR accuracy
    """
    # Read image using OpenCV
    image = cv2.imread(image_path)
    
    # Convert to grayscale for better OCR performance
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Apply adaptive thresholding to create binary image
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Apply morphological operations to clean up the image
    kernel = np.ones((1, 1), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    return cleaned  # Return preprocessed image

def extract_text_from_image(image_path):
    """
    41-60: Extract raw text from image using Tesseract OCR
    """
    try:
        # Preprocess image for better OCR results
        processed_image = preprocess_image(image_path)
        
        # Convert OpenCV image to PIL Image for Tesseract
        pil_image = Image.fromarray(processed_image)
        
        # Configure Tesseract OCR settings for better accuracy
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@.-+()[] '
        
        # Extract text using Tesseract
        extracted_text = pytesseract.image_to_string(pil_image, config=custom_config)
        
        return extracted_text.strip()  # Return cleaned extracted text
        
    except Exception as e:
        print(f"Error during OCR processing: {str(e)}")
        return ""  # Return empty string if OCR fails

def extract_data(text):
    """
    61-120: Helper function to extract structured data from raw OCR text
    """
    # Initialize data dictionary with default values
    data = {
        'name': '',
        'email': '',
        'phone': '',
        'company': ''
    }
    
    # Split text into lines for processing
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    if not lines:
        return data  # Return empty data if no text found
    
    # 81-90: Extract name (assume first non-empty line is the name)
    data['name'] = lines[0] if lines else ''
    
    # 91-100: Extract email using regex pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text, re.IGNORECASE)
    if email_match:
        data['email'] = email_match.group()
    
    # 101-110: Extract phone number using regex pattern
    # Matches various phone formats: +91-9876543210, 9876543210, (98765) 43210, etc.
    phone_pattern = r'(\+91[-.\s]?)?(\(?\d{5}\)?[-.\s]?\d{5}|\(?\d{4}\)?[-.\s]?\d{6}|\(?\d{3}\)?[-.\s]?\d{7}|\d{10})'
    phone_match = re.search(phone_pattern, text)
    if phone_match:
        # Clean phone number by removing special characters
        phone_clean = re.sub(r'[^\d+]', '', phone_match.group())
        data['phone'] = phone_clean
    
    # 111-120: Extract company name (look for company-related keywords or last line)
    company_keywords = ['ltd', 'limited', 'inc', 'corp', 'corporation', 'pvt', 'private', 'company', 'co.']
    
    for line in lines[1:]:  # Skip first line (name)
        # Check if line contains company keywords
        if any(keyword.lower() in line.lower() for keyword in company_keywords):
            data['company'] = line
            break
    
    # If no company found with keywords, use the longest line (excluding name and contact info)
    if not data['company'] and len(lines) > 2:
        # Filter out lines that contain email or phone
        potential_company_lines = []
        for line in lines[1:]:
            if not re.search(email_pattern, line, re.IGNORECASE) and not re.search(phone_pattern, line):
                potential_company_lines.append(line)
        
        # Select the longest remaining line as company name
        if potential_company_lines:
            data['company'] = max(potential_company_lines, key=len)
    
    return data  # Return extracted structured data
