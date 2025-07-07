# 1-10: Import modules
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app, send_file
import os
import time
from app.ocr import extract_data_from_image_gemini
from app.mongo import load_extraction_data, add_extraction_record, update_extraction_record, delete_extraction_record, get_recent_extractions
from app.utils import save_uploaded_file, generate_excel_from_mongo, cleanup_temp_files, allowed_file, generate_advanced_analytics_report, generate_filtered_excel_by_labels, generate_filtered_excel_by_countries

# 11-20: Blueprint creation
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """
    21-30: Home page route - render file upload form with recent extractions from MongoDB
    """
    # Get recent extractions from MongoDB
    recent_extractions = get_recent_extractions(limit=5)
    
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
    
    # Extract event information from form (optional)
    event_info = {
        'event_name': request.form.get('event_name', '').strip(),
        'event_description': request.form.get('event_description', '').strip(),
        'event_host': request.form.get('event_host', '').strip(),
        'event_date': request.form.get('event_date', '').strip(),
        'event_location': request.form.get('event_location', '').strip()
    }
    
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
                    
                    # Only add to processed data if we got valid results
                    if any(structured_data.get(field, '').strip() for field in ['name', 'email', 'phone', 'company']):
                        # Detect country and add management fields
                        from app.mongo import detect_country_from_company, store_card_with_image
                        country_code, flag = detect_country_from_company(structured_data.get('company', ''))
                        structured_data['country'] = country_code
                        structured_data['flag'] = flag
                        structured_data['is_sorted'] = False  # New cards start as unsorted
                        
                        # Add event information to extracted data
                        structured_data.update(event_info)
                        
                        # Store card with image in MongoDB
                        record_id = store_card_with_image(structured_data, image_bytes, file.filename)
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
    
    # Display success message if we have processed data
    if processed_data:
        success_msg = f'Successfully processed {len(processed_data)} visiting cards using Gemini AI and saved to MongoDB'
        if skipped_files:
            success_msg += f' ({len(skipped_files)} files skipped)'
        flash(success_msg, 'success')
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
    121-140: View all extracted results from MongoDB
    """
    try:
        # Load all data from MongoDB
        results = load_extraction_data()
        print(f"📊 Loaded {len(results)} records from MongoDB")
        
        # Render results page with data
        return render_template('results.html', results=results)
        
    except Exception as e:
        print(f"❌ Error in view_results: {str(e)}")
        flash(f'Error reading results: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/api/recent')
def api_recent_extractions():
    """
    141-160: API endpoint to get recent extractions from MongoDB for AJAX updates
    """
    try:
        # Get recent extractions from MongoDB
        recent_extractions = get_recent_extractions(limit=5)
        
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
            'filename': request.form.get('filename', '').strip(),
            # Event-related fields for company events/meetings
            'event_name': request.form.get('event_name', '').strip(),
            'event_description': request.form.get('event_description', '').strip(),
            'event_host': request.form.get('event_host', '').strip(),
            'event_date': request.form.get('event_date', '').strip(),
            'event_location': request.form.get('event_location', '').strip()
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
    201-220: Route to generate and download Excel file from MongoDB data (no local storage)
    """
    try:
        print("📥 Download request for Excel file from MongoDB")
        
        # Generate Excel file in memory from MongoDB data
        excel_buffer = generate_excel_from_mongo()
        
        if excel_buffer:
            print("✅ Sending Excel file to user")
            return send_file(
                excel_buffer, 
                as_attachment=True, 
                download_name='visiting_cards_data.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            print("❌ No data available for download")
            flash('No data available for download. Please process some cards first.', 'warning')
            return redirect(url_for('main.index'))
            
    except Exception as e:
        print(f"❌ Error downloading Excel file: {str(e)}")
        flash(f'Error downloading file: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/download/advanced')
def download_advanced_report():
    """
    Route to generate and download advanced analytics Excel report
    """
    try:
        print("📊 Download request for advanced analytics report")
        
        # Generate advanced Excel report with charts and analytics
        excel_buffer = generate_advanced_analytics_report()
        
        if excel_buffer:
            print("✅ Sending advanced analytics report to user")
            return send_file(
                excel_buffer, 
                as_attachment=True, 
                download_name='visiting_cards_analytics_report.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            print("❌ No data available for advanced report")
            flash('No data available for advanced report. Please process some cards first.', 'warning')
            return redirect(url_for('main.index'))
            
    except Exception as e:
        print(f"❌ Error generating advanced report: {str(e)}")
        flash(f'Error generating advanced report: {str(e)}', 'error')
        return redirect(url_for('main.index'))

@main_bp.route('/download/filtered')
def download_filtered_export():
    """
    Route to generate and download filtered Excel export based on labels or countries
    """
    try:
        print("🏷️ Download request for filtered export")
        
        export_type = request.args.get('type', '')
        
        if export_type == 'labels':
            # Get selected label IDs and unlabeled option
            label_ids = request.args.getlist('labels')
            include_unlabeled = request.args.get('include_unlabeled') == 'true'
            
            # Convert label IDs to integers
            label_ids = [int(id) for id in label_ids if id.isdigit()]
            
            print(f"📋 Filtering by labels: {label_ids}, include unlabeled: {include_unlabeled}")
            excel_buffer = generate_filtered_excel_by_labels(label_ids, include_unlabeled)
            filename = 'visiting_cards_filtered_by_labels.xlsx'
            
        elif export_type == 'countries':
            # Get selected countries
            countries = request.args.getlist('countries')
            
            print(f"🌍 Filtering by countries: {countries}")
            excel_buffer = generate_filtered_excel_by_countries(countries)
            filename = 'visiting_cards_filtered_by_countries.xlsx'
            
        else:
            flash('Invalid export type specified', 'error')
            return redirect(url_for('main.index'))
        
        if excel_buffer:
            print("✅ Sending filtered export to user")
            return send_file(
                excel_buffer, 
                as_attachment=True, 
                download_name=filename,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            print("❌ No data available for filtered export")
            flash('No data matches the selected filters.', 'warning')
            return redirect(url_for('main.index'))
            
    except Exception as e:
        print(f"❌ Error generating filtered export: {str(e)}")
        flash(f'Error generating filtered export: {str(e)}', 'error')
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
            return jsonify({
                'success': True,
                'message': f'Processed {len(processed_data)} files using Gemini AI and saved to MongoDB',
                'data': processed_data
            })
        else:
            return jsonify({'error': 'No valid data extracted'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 121-160: Data management interface routes
@main_bp.route('/manage')
def manage_data():
    """
    Render the data management interface
    """
    from app.mongo import get_all_labels, get_cards_by_status, update_extraction_record, detect_country_from_company
    
    # Get unsorted and sorted cards
    unsorted_cards = get_cards_by_status(is_sorted=False)
    sorted_cards = get_cards_by_status(is_sorted=True)
    labels = get_all_labels()
    
    # Backfill country data for cards that don't have it
    all_cards = unsorted_cards + sorted_cards
    for card in all_cards:
        if not card.get('country') or card.get('country') == 'UNKNOWN' or not card.get('flag'):
            if card.get('company'):
                country_code, flag = detect_country_from_company(card['company'])
                # Update the card with country information
                update_data = {'country': country_code, 'flag': flag}
                update_extraction_record(card['id'], update_data)
                # Update the card object for immediate display
                card['country'] = country_code
                card['flag'] = flag
                print(f"🌍 Updated card {card['id']} with country: {country_code} {flag}")
    
    return render_template('manage.html', 
                         unsorted_cards=unsorted_cards,
                         sorted_cards=sorted_cards,
                         labels=labels)

@main_bp.route('/api/labels', methods=['GET', 'POST'])
def handle_labels():
    """
    Handle label operations (GET all labels, POST create new label)
    """
    if request.method == 'GET':
        from app.mongo import get_all_labels
        labels = get_all_labels()
        return jsonify({'success': True, 'labels': labels})
    
    elif request.method == 'POST':
        from app.mongo import create_label
        data = request.get_json()
        label_name = data.get('name', '').strip()
        color = data.get('color', '#0891b2')
        
        if not label_name:
            return jsonify({'success': False, 'message': 'Label name is required'})
        
        label = create_label(label_name, color)
        if label:
            return jsonify({'success': True, 'label': label})
        else:
            return jsonify({'success': False, 'message': 'Failed to create label'})

@main_bp.route('/api/labels/<int:label_id>', methods=['PUT', 'DELETE'])
def handle_label_operations(label_id):
    """
    Handle label operations (PUT for edit, DELETE for delete)
    """
    if request.method == 'PUT':
        from app.mongo import update_label
        data = request.get_json()
        label_name = data.get('name', '').strip()
        color = data.get('color', '#0891b2')
        
        if not label_name:
            return jsonify({'success': False, 'message': 'Label name is required'})
        
        if update_label(label_id, label_name, color):
            return jsonify({'success': True, 'message': 'Label updated successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to update label'})
    
    elif request.method == 'DELETE':
        from app.mongo import delete_label
        if delete_label(label_id):
            return jsonify({'success': True, 'message': 'Label deleted successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to delete label'})

@main_bp.route('/api/cards/<int:card_id>/label', methods=['POST', 'DELETE'])
def handle_card_label(card_id):
    """
    Assign or remove label from a card
    """
    if request.method == 'POST':
        from app.mongo import assign_label_to_card
        data = request.get_json()
        label_id = data.get('label_id')
        label_name = data.get('label_name')
        
        if assign_label_to_card(card_id, label_id, label_name):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to assign label'})
    
    elif request.method == 'DELETE':
        from app.mongo import remove_label_from_card
        if remove_label_from_card(card_id):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to remove label'})

@main_bp.route('/api/cards/search')
def search_cards():
    """
    Search cards by query
    """
    from app.mongo import search_cards
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({'success': False, 'message': 'Search query is required'})
    
    cards = search_cards(query)
    return jsonify({'success': True, 'cards': cards})

@main_bp.route('/api/cards/<int:card_id>', methods=['PUT', 'DELETE'])
def handle_card(card_id):
    """
    Update or delete a card
    """
    if request.method == 'PUT':
        from app.mongo import update_extraction_record, detect_country_from_company
        data = request.get_json()
        
        # Detect country if company is updated but no country is explicitly provided
        if 'company' in data and ('country' not in data or not data.get('country') or data.get('country').strip() == ''):
            country_code, flag = detect_country_from_company(data['company'])
            data['country'] = country_code
            data['flag'] = flag
        
        if update_extraction_record(card_id, data):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to update card'})
    
    elif request.method == 'DELETE':
        from app.mongo import delete_extraction_record
        if delete_extraction_record(card_id):
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Failed to delete card'})

@main_bp.route('/api/cards/by-label/<int:label_id>')
def get_cards_by_label_api(label_id):
    """
    Get all cards with a specific label
    """
    from app.mongo import get_cards_by_label
    cards = get_cards_by_label(label_id)
    return jsonify({'success': True, 'cards': cards})

@main_bp.route('/api/cards/<int:card_id>/preview')
def get_card_preview(card_id):
    """
    Get complete card data including image for preview
    """
    from app.mongo import get_card_with_image
    
    card = get_card_with_image(card_id)
    if card:
        return jsonify({'success': True, 'card': card})
    else:
        return jsonify({'success': False, 'message': 'Card not found'})

@main_bp.route('/api/cards/<int:card_id>/edit', methods=['PUT'])
def update_card_preview(card_id):
    """
    Update card data from preview panel
    """
    from app.mongo import update_card_data
    
    data = request.get_json()
    
    # Validate required fields
    allowed_fields = ['name', 'company', 'email', 'phone', 'website', 'designation', 'country', 'flag',
                     'event_name', 'event_description', 'event_host', 'event_date', 'event_location']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if update_card_data(card_id, update_data):
        return jsonify({'success': True, 'message': 'Card updated successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to update card'})

@main_bp.route('/api/countries')
def get_countries():
    """
    Get all available countries and flags for selection
    """
    from app.mongo import get_all_country_flags
    
    countries = get_all_country_flags()
    return jsonify({'success': True, 'countries': countries})
