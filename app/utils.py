# 1-10: Importing modules
import os  # OS module for file operations
import csv  # CSV module for file handling
from werkzeug.utils import secure_filename  # Secure filename utility
import uuid  # UUID for generating unique filenames

# 11-20: File validation configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}  # Supported image formats

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

def save_to_csv(data_list, csv_filename='output.csv'):
    """
    51-80: Save extracted data to CSV file
    """
    # Define CSV headers
    fieldnames = ['name', 'email', 'phone', 'company']
    
    # Check if CSV file exists
    file_exists = os.path.isfile(csv_filename)
    
    try:
        # Open CSV file in append mode
        with open(csv_filename, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write headers if file is new
            if not file_exists:
                writer.writeheader()
            
            # Write data rows
            for data in data_list:
                # Ensure all required fields exist
                row_data = {
                    'name': data.get('name', ''),
                    'email': data.get('email', ''),
                    'phone': data.get('phone', ''),
                    'company': data.get('company', '')
                }
                writer.writerow(row_data)
        
        return True  # Return True if save successful
        
    except Exception as e:
        print(f"Error saving to CSV: {str(e)}")
        return False  # Return False if save failed

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
