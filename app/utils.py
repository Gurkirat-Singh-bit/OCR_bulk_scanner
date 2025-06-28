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
    51-80: Save extracted data to Excel file (append mode with duplicate checking)
    """
    print(f"💾 Saving {len(data_list)} records to Excel...")
    
    # Get absolute path for Excel file (save in static/results/)
    if not os.path.isabs(excel_filename):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        excel_filename = os.path.join(project_root, 'static', 'results', excel_filename)
    
    print(f"📁 Excel file path: {excel_filename}")
    
    try:
        existing_data = []
        
        # Check if Excel file exists
        if os.path.exists(excel_filename):
            print("📖 Loading existing Excel file...")
            workbook = load_workbook(excel_filename)
            worksheet = workbook.active
            
            # Read existing data to check for duplicates
            for row in worksheet.iter_rows(min_row=2, values_only=True):
                if any(row):  # Skip empty rows
                    existing_data.append({
                        'name': row[0] or '',
                        'phone': row[1] or '',
                        'email': row[2] or '',
                        'company': row[3] or '',
                        'website': row[4] or '',
                        'address': row[5] or '' if len(row) > 5 else '',
                        'filename': row[6] or '' if len(row) > 6 else ''
                    })
        else:
            print("📝 Creating new Excel file...")
            workbook = Workbook()
            worksheet = workbook.active
            
            # Add comprehensive headers for new file
            headers = ['Name', 'Phone', 'Email', 'Company', 'Website', 'Address', 'Filename']
            worksheet.append(headers)
            print("✅ Headers added to new Excel file")
        
        # Append new data rows (skip duplicates)
        rows_added = 0
        skipped_duplicates = 0
        
        for data in data_list:
            # Check for duplicates based on name and phone/email
            is_duplicate = False
            for existing in existing_data:
                if (data.get('name', '').lower() == existing['name'].lower() and 
                    (data.get('phone', '') == existing['phone'] or 
                     data.get('email', '').lower() == existing['email'].lower()) and
                    existing['name']):  # Only if existing name is not empty
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                row_data = [
                    data.get('name', ''),
                    data.get('phone', ''),
                    data.get('email', ''),
                    data.get('company', ''),
                    data.get('website', ''),
                    data.get('address', ''),
                    data.get('filename', '')
                ]
                worksheet.append(row_data)
                rows_added += 1
                print(f"✅ Added row {rows_added}: {data.get('name', 'Unknown')}")
            else:
                skipped_duplicates += 1
                print(f"⚠️ Skipped duplicate: {data.get('name', 'Unknown')}")
        
        # Save workbook
        workbook.save(excel_filename)
        workbook.close()
        
        if skipped_duplicates > 0:
            print(f"💾 Successfully saved {rows_added} new rows, skipped {skipped_duplicates} duplicates")
        else:
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
