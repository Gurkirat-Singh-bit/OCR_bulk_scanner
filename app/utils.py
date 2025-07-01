# 1-10: Importing modules
import os  # OS module for file operations
from openpyxl import Workbook  # Excel file handling
from werkzeug.utils import secure_filename  # Secure filename utility
import uuid  # UUID for generating unique filenames
from io import BytesIO  # For in-memory file handling
from app.mongo import load_extraction_data  # Import MongoDB data loading function

# 11-20: File validation configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}  # Supported image formats only

def allowed_file(filename):
    """
    21-30: Check if uploaded file has allowed extension
    """
    # Check if filename contains dot and extension is in allowed list
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, upload_folder):
    """
    31-50: Save uploaded file with secure filename
    """
    if file and allowed_file(file.filename):
        # Generate unique filename to avoid conflicts
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        
        # Create secure filename
        filename = secure_filename(unique_filename)
        
        # Create full file path
        file_path = os.path.join(upload_folder, filename)
        
        # Save file to upload folder
        file.save(file_path)
        
        return file_path  # Return saved file path
    
    return None  # Return None if file is invalid

def generate_excel_from_mongo():
    """
    51-80: Generate Excel file in memory from MongoDB data (no local file storage)
    Returns BytesIO object containing Excel data for direct download
    """
    print("� Generating Excel file from MongoDB data...")
    
    try:
        # Load all data from MongoDB
        data_list = load_extraction_data()
        
        if not data_list:
            print("⚠️ No data found in MongoDB")
            return None
        
        # Create new workbook in memory
        workbook = Workbook()
        worksheet = workbook.active
        
        # Add comprehensive headers
        headers = ['Name', 'Phone', 'Email', 'Company', 'Website', 'Address', 'Filename', 'Timestamp', 
                  'Event Name', 'Event Description', 'Event Host', 'Event Date', 'Event Location']
        worksheet.append(headers)
        print("✅ Headers added to Excel file")
        
        # Add data rows
        rows_added = 0
        for data in data_list:
            row_data = [
                data.get('name', ''),
                data.get('phone', ''),
                data.get('email', ''),
                data.get('company', ''),
                data.get('website', ''),
                data.get('address', ''),
                data.get('filename', ''),
                data.get('timestamp', ''),
                # Event-related fields
                data.get('event_name', ''),
                data.get('event_description', ''),
                data.get('event_host', ''),
                data.get('event_date', ''),
                data.get('event_location', '')
            ]
            worksheet.append(row_data)
            rows_added += 1
        
        # Save to BytesIO object (in memory)
        excel_buffer = BytesIO()
        workbook.save(excel_buffer)
        workbook.close()
        
        # Reset buffer position to beginning
        excel_buffer.seek(0)
        
        print(f"💾 Successfully generated Excel with {rows_added} rows in memory")
        return excel_buffer
        
    except Exception as e:
        print(f"❌ Error generating Excel: {str(e)}")
        return None

def cleanup_temp_files(file_paths):
    """
    81-100: Clean up temporary uploaded files
    """
    for file_path in file_paths:
        try:
            # Remove file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🧹 Cleaned up temporary file: {file_path}")
        except Exception as e:
            print(f"❌ Error cleaning up file {file_path}: {str(e)}")

def validate_extracted_data(data):
    """
    101-120: Validate extracted data before saving to MongoDB
    """
    # Check if at least name or email or phone is present
    required_fields = ['name', 'email', 'phone']
    has_required_data = any(data.get(field, '').strip() for field in required_fields)
    
    return has_required_data  # Return True if valid data found
