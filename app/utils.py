# 1-10: Importing modules
import os  # OS module for file operations
from openpyxl import Workbook, load_workbook  # Excel file handling
from werkzeug.utils import secure_filename  # Secure filename utility
import uuid  # UUID for generating unique filenames

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

def save_to_excel(data_list, excel_filename='output.xlsx'):
    """
    51-80: Save extracted data to Excel file (append mode)
    """
    print(f"💾 Saving {len(data_list)} records to Excel...")
    
    # Get absolute path for Excel file (save in project root)
    if not os.path.isabs(excel_filename):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        excel_filename = os.path.join(project_root, excel_filename)
    
    print(f"📁 Excel file path: {excel_filename}")
    
    try:
        # Check if Excel file exists
        if os.path.exists(excel_filename):
            print("📖 Loading existing Excel file...")
            workbook = load_workbook(excel_filename)
            worksheet = workbook.active
        else:
            print("📝 Creating new Excel file...")
            workbook = Workbook()
            worksheet = workbook.active
            
            # Add headers for new file
            headers = ['Name', 'Email', 'Phone', 'Company', 'Filename']
            worksheet.append(headers)
            print("✅ Headers added to new Excel file")
        
        # Append new data rows
        rows_added = 0
        for data in data_list:
            row_data = [
                data.get('name', ''),
                data.get('email', ''),
                data.get('phone', ''),
                data.get('company', ''),
                data.get('filename', '')
            ]
            worksheet.append(row_data)
            rows_added += 1
            print(f"✅ Added row {rows_added}: {data.get('name', 'Unknown')}")
        
        # Save workbook
        workbook.save(excel_filename)
        workbook.close()
        
        print(f"💾 Successfully saved {rows_added} rows to {excel_filename}")
        return True
        
    except Exception as e:
        print(f"❌ Error saving to Excel: {str(e)}")
        return False

def cleanup_temp_files(file_paths):
    """
    81-100: Clean up temporary uploaded files
    """
    for file_path in file_paths:
        try:
            # Remove file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            print(f"Error cleaning up file {file_path}: {str(e)}")

def validate_extracted_data(data):
    """
    101-120: Validate extracted data before saving
    """
    # Check if at least name or email or phone is present
    required_fields = ['name', 'email', 'phone']
    has_required_data = any(data.get(field, '').strip() for field in required_fields)
    
    return has_required_data  # Return True if valid data found
