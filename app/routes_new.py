# 1-10: Import modules
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app, send_file
import os
import time
from app.ocr import extract_data_from_image_gemini, load_extraction_data, save_extraction_data, add_extraction_record, update_extraction_record, delete_extraction_record
from app.utils import save_uploaded_file, save_to_excel, cleanup_temp_files, allowed_file

# 11-20: Blueprint creation
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """
    21-30: Home page route - render file upload form with recent extractions
    """
    # Get recent extractions from JSON data
    all_data = load_extraction_data()
    recent_extractions = all_data[-5:] if len(all_data) > 5 else all_data
    recent_extractions.reverse()  # Show most recent first
    
    return render_template('index.html', recent_extractions=recent_extractions)

@main_bp.route('/upload', methods=['POST'])
def upload_files():
    """
    31-120: Handle bulk file upload and Gemini Vision API extraction with progress tracking
    """
    print("🚀 Starting bulk file upload process...")
    
    # Validate uploaded files
    if 'files' not in request.files:
        flash('No files selected', 'error')
        return redirect(url_for('main.index'))
    
    uploaded_files = request.files.getlist('files')
    
    if not uploaded_files or all(file.filename == '' for file in uploaded_files):
        flash('No files selected', 'error')
        return redirect(url_for('main.index'))
    
    # Initialize processing variables
    processed_data = []
    saved_file_paths = []
    upload_folder = current_app.config['UPLOAD_FOLDER']
    skipped_files = []
    total_files = len(uploaded_files)
    processed_count = 0
    
    os.makedirs(upload_folder, exist_ok=True)
    print(f"📁 Upload folder: {upload_folder}")
    print(f"📊 Total files to process: {total_files}")
    
    # Process each uploaded file
    for idx, file in enumerate(uploaded_files):
        if file and file.filename != '':
            print(f"\n📄 Processing file {idx + 1}/{total_files}: {file.filename}")
            
            # Check file format before processing
            if not allowed_file(file.filename):
                print(f"❌ Unsupported format: {file.filename}")
                skipped_files.append(file.filename)
                continue
            
            try:
                # Save uploaded file temporarily
                file_path = save_uploaded_file(file, upload_folder)
                
                if file_path:
                    saved_file_paths.append(file_path)
                    print(f"💾 File saved: {file_path}")
                    
                    # Read image as bytes for Gemini API
                    with open(file_path, 'rb') as img_file:
                        image_bytes = img_file.read()
                    
                    # Extract structured data using Gemini Vision API
                    structured_data = extract_data_from_image_gemini(image_bytes)
                    
                    # Add filename to the extracted data
                    structured_data['filename'] = file.filename
                    
                    # Only add to processed data if we got valid results
                    if any(structured_data.get(field, '').strip() for field in ['name', 'email', 'phone', 'company']):
                        # Add to JSON data store
                        record_id = add_extraction_record(structured_data)
                        structured_data['id'] = record_id
                        
                        processed_data.append(structured_data)
                        processed_count += 1
                        print(f"✅ Data extracted for: {file.filename} - {structured_data}")
                    else:
                        print(f"⚠️ No valid data extracted from {file.filename}")
                else:
                    print(f"❌ Failed to save {file.filename}")
                    
            except Exception as e:
                print(f"❌ Error processing {file.filename}: {str(e)}")
                continue
    
    # Handle results and messages
    if skipped_files:
        flash(f'Skipped {len(skipped_files)} unsupported files: {", ".join(skipped_files[:5])}{"..." if len(skipped_files) > 5 else ""}. Please upload PNG, JPG, JPEG, or WEBP only.', 'warning')
    
    # Save to Excel if we have processed data
    if processed_data:
        if save_to_excel(processed_data):
            success_msg = f'Successfully processed {len(processed_data)} visiting cards using Gemini AI'
            if skipped_files:
                success_msg += f' ({len(skipped_files)} files skipped)'
            flash(success_msg, 'success')
        else:
            flash('Error saving data to Excel file', 'error')
    else:
        if not skipped_files:
            flash('No valid data extracted from any uploaded files', 'error')
        else:
            flash('All uploaded files were skipped due to unsupported formats', 'warning')
    
    # Clean up temporary files
    cleanup_temp_files(saved_file_paths)
    print("🧹 Cleanup completed")
    print(f"📊 Final stats: {processed_count} processed, {len(skipped_files)} skipped, {total_files} total")
    
    return redirect(url_for('main.index'))

@main_bp.route('/results')
def view_results():
    """
    121-140: View all extracted results from JSON data
    """
    try:
        # Load all data from JSON
        results = load_extraction_data()
        print(f"📊 Loaded {len(results)} records from JSON data")
        
        # Render results page with data
        return render_template('results.html', results=results)
        
    except Exception as e:
        print(f"❌ Error in view_results: {str(e)}")
        flash(f'Error reading results: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/api/recent')
def api_recent_extractions():
    """
    141-160: API endpoint to get recent extractions for AJAX updates
    """
    try:
        # Load all data and get recent 5
        all_data = load_extraction_data()
        recent_extractions = all_data[-5:] if len(all_data) > 5 else all_data
        recent_extractions.reverse()  # Show most recent first
        
        return jsonify({
            'success': True,
            'data': recent_extractions,
            'count': len(recent_extractions)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@main_bp.route('/edit/<int:record_id>', methods=['POST'])
def edit_record(record_id):
    """
    161-180: Edit an extraction record
    """
    try:
        updated_data = {
            'name': request.form.get('name', '').strip(),
            'email': request.form.get('email', '').strip(),
            'phone': request.form.get('phone', '').strip(),
            'company': request.form.get('company', '').strip(),
            'filename': request.form.get('filename', '').strip()
        }
        
        if update_extraction_record(record_id, updated_data):
            flash('Record updated successfully', 'success')
        else:
            flash('Record not found', 'error')
            
    except Exception as e:
        flash(f'Error updating record: {str(e)}', 'error')
    
    return redirect(url_for('main.view_results'))

@main_bp.route('/delete/<int:record_id>', methods=['POST'])
def delete_record(record_id):
    """
    181-200: Delete an extraction record
    """
    try:
        if delete_extraction_record(record_id):
            flash('Record deleted successfully', 'success')
        else:
            flash('Record not found', 'error')
            
    except Exception as e:
        flash(f'Error deleting record: {str(e)}', 'error')
    
    return redirect(url_for('main.view_results'))

@main_bp.route('/download')
def download_excel():
    """
    201-220: Route to download the Excel file
    """
    try:
        # Get absolute path for Excel file
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        excel_path = os.path.join(project_root, 'static', 'results', 'output.xlsx')
        
        print(f"📥 Download request for Excel file: {excel_path}")
        
        # Check if Excel file exists
        if os.path.exists(excel_path):
            print("✅ Sending Excel file to user")
            return send_file(
                excel_path, 
                as_attachment=True, 
                download_name='visiting_cards_data.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            print("❌ Excel file not found")
            flash('No data available for download. Please process some cards first.', 'warning')
            return redirect(url_for('main.index'))
            
    except Exception as e:
        print(f"❌ Error downloading Excel file: {str(e)}")
        flash(f'Error downloading file: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/api/progress/<session_id>')
def get_progress(session_id):
    """
    221-240: Track progress count and send to frontend
    """
    # This can be enhanced with real-time progress tracking using sessions
    return jsonify({'progress': 100, 'status': 'completed'})

@main_bp.route('/api/upload', methods=['POST'])
def api_upload():
    """
    241-280: API endpoint for file upload (JSON response)
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
                if allowed_file(file.filename):
                    file_path = save_uploaded_file(file, upload_folder)
                    if file_path:
                        # Read image as bytes
                        with open(file_path, 'rb') as img_file:
                            image_bytes = img_file.read()
                        
                        # Extract using Gemini
                        structured_data = extract_data_from_image_gemini(image_bytes)
                        structured_data['filename'] = file.filename
                        
                        # Add to JSON data store
                        record_id = add_extraction_record(structured_data)
                        structured_data['id'] = record_id
                        
                        processed_data.append(structured_data)
                        
                        # Clean up individual file
                        cleanup_temp_files([file_path])
        
        if processed_data:
            save_to_excel(processed_data)
            return jsonify({
                'success': True,
                'message': f'Processed {len(processed_data)} files using Gemini AI',
                'data': processed_data
            })
        else:
            return jsonify({'error': 'No valid data extracted'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
