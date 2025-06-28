# 1-10: Importing modules
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
import os  # OS module for file operations
from app.ocr import extract_text_from_image, extract_data  # Import OCR functions
from app.utils import save_uploaded_file, save_to_csv, cleanup_temp_files, validate_extracted_data  # Import utility functions

# 11-20: Blueprint creation
main_bp = Blueprint('main', __name__)  # Create main blueprint for routes

@main_bp.route('/')
def index():
    """
    21-30: Home page route - render file upload form
    """
    # Render the main upload page
    return render_template('index.html')

@main_bp.route('/upload', methods=['POST'])
def upload_files():
    """
    31-100: Handle file upload and OCR processing
    """
    # Check if files were uploaded
    if 'files' not in request.files:
        flash('No files selected', 'error')
        return redirect(url_for('main.index'))
    
    # Get uploaded files list
    uploaded_files = request.files.getlist('files')
    
    # Validate that files were actually selected
    if not uploaded_files or all(file.filename == '' for file in uploaded_files):
        flash('No files selected', 'error')
        return redirect(url_for('main.index'))
    
    # 41-50: Initialize processing variables
    processed_data = []  # List to store extracted data
    saved_file_paths = []  # List to track saved files for cleanup
    upload_folder = current_app.config['UPLOAD_FOLDER']  # Get upload folder path
    
    # Create upload folder if it doesn't exist
    os.makedirs(upload_folder, exist_ok=True)
    
    # 51-80: Process each uploaded file
    for file in uploaded_files:
        if file and file.filename != '':
            try:
                # Save uploaded file with secure filename
                file_path = save_uploaded_file(file, upload_folder)
                
                if file_path:
                    saved_file_paths.append(file_path)  # Track for cleanup
                    
                    # Extract text from image using OCR
                    raw_text = extract_text_from_image(file_path)
                    
                    if raw_text:
                        # Extract structured data from raw text
                        structured_data = extract_data(raw_text)
                        
                        # Validate extracted data
                        if validate_extracted_data(structured_data):
                            # Add filename for reference
                            structured_data['filename'] = file.filename
                            processed_data.append(structured_data)
                        else:
                            flash(f'No valid data extracted from {file.filename}', 'warning')
                    else:
                        flash(f'No text found in {file.filename}', 'warning')
                else:
                    flash(f'Failed to save {file.filename}', 'error')
                    
            except Exception as e:
                flash(f'Error processing {file.filename}: {str(e)}', 'error')
                continue
    
    # 81-100: Save extracted data and cleanup
    if processed_data:
        # Save all extracted data to CSV
        if save_to_csv(processed_data):
            flash(f'Successfully processed {len(processed_data)} visiting cards and saved to output.csv', 'success')
        else:
            flash('Error saving data to CSV file', 'error')
    else:
        flash('No valid data extracted from any uploaded files', 'error')
    
    # Clean up temporary files
    cleanup_temp_files(saved_file_paths)
    
    # Redirect back to home page with results
    return redirect(url_for('main.index'))

@main_bp.route('/results')
def view_results():
    """
    101-120: View extracted results (optional route for displaying CSV data)
    """
    try:
        import csv
        results = []
        
        # Read CSV file if it exists
        if os.path.exists('output.csv'):
            with open('output.csv', 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                results = list(reader)
        
        # Render results page with data
        return render_template('results.html', results=results)
        
    except Exception as e:
        flash(f'Error reading results: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/api/upload', methods=['POST'])
def api_upload():
    """
    121-150: API endpoint for file upload (JSON response)
    """
    try:
        # Similar processing as upload_files but returns JSON
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        uploaded_files = request.files.getlist('files')
        if not uploaded_files or all(file.filename == '' for file in uploaded_files):
            return jsonify({'error': 'No valid files provided'}), 400
        
        processed_data = []
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        for file in uploaded_files:
            if file and file.filename != '':
                file_path = save_uploaded_file(file, upload_folder)
                if file_path:
                    raw_text = extract_text_from_image(file_path)
                    if raw_text:
                        structured_data = extract_data(raw_text)
                        if validate_extracted_data(structured_data):
                            structured_data['filename'] = file.filename
                            processed_data.append(structured_data)
                    # Clean up individual file
                    cleanup_temp_files([file_path])
        
        if processed_data:
            save_to_csv(processed_data)
            return jsonify({
                'success': True,
                'message': f'Processed {len(processed_data)} files',
                'data': processed_data
            })
        else:
            return jsonify({'error': 'No valid data extracted'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
