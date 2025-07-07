# 1-10: Importing modules
import os
import time
from datetime import datetime
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
import base64
import io
from PIL import Image

# Load environment variables
load_dotenv()

# 11-20: MongoDB connection setup
def get_mongo_connection():
    """
    Establish connection to MongoDB database
    Returns the collection object for direct use
    """
    try:
        # Get MongoDB configuration from environment variables
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        database_name = os.getenv('MONGODB_DATABASE', 'visiting_card_db')
        collection_name = os.getenv('MONGODB_COLLECTION', 'extractions')
        
        # Create MongoDB client
        client = MongoClient(mongodb_uri)
        
        # Test connection by pinging the server
        client.admin.command('ping')
        
        # Get database and collection
        database = client[database_name]
        collection = database[collection_name]
        
        # Force database/collection creation by inserting and removing a dummy document
        dummy_doc = {"_dummy": True}
        result = collection.insert_one(dummy_doc)
        collection.delete_one({"_id": result.inserted_id})
        
        # Create indexes for better performance
        create_indexes(collection)
        
        print(f"✅ MongoDB connected: {database_name}.{collection_name}")
        print(f"✅ Database and collection created successfully")
        return collection
        
    except Exception as e:
        print(f"❌ MongoDB connection error: {str(e)}")
        raise e

# 21-30: Index creation for performance optimization
def create_indexes(collection):
    """
    Create indexes on frequently queried fields for better performance
    """
    try:
        # Create compound index on name and email for duplicate checking
        collection.create_index([("name", ASCENDING), ("email", ASCENDING)], name="name_email_idx")
        
        # Create index on timestamp for sorting recent records
        collection.create_index([("timestamp", ASCENDING)], name="timestamp_idx")
        
        # Create index on phone for quick lookup
        collection.create_index([("phone", ASCENDING)], name="phone_idx")
        
        # Create unique index on id field
        collection.create_index([("id", ASCENDING)], unique=True, name="id_idx")
        
        print("✅ MongoDB indexes created successfully")
        
    except Exception as e:
        print(f"⚠️ Index creation warning: {str(e)}")

# 31-40: Initialize collection object for export
try:
    collection = get_mongo_connection()
except Exception as e:
    print(f"❌ Failed to initialize MongoDB collection: {str(e)}")
    collection = None

# 41-50: CRUD operations for extraction records
def add_extraction_record(record_data):
    """
    Add a new extraction record to MongoDB
    Returns the generated record ID
    """
    try:
        # Add unique ID and timestamp
        record_id = int(time.time() * 1000)  # Unique timestamp ID
        record_data['id'] = record_id
        record_data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        record_data['created_at'] = datetime.now()
        
        # Insert into MongoDB
        result = collection.insert_one(record_data)
        
        if result.inserted_id:
            print(f"✅ Record added to MongoDB: {record_id}")
            return record_id
        else:
            print(f"❌ Failed to add record to MongoDB")
            return None
            
    except Exception as e:
        print(f"❌ Error adding record to MongoDB: {str(e)}")
        return None

# 51-60: Load all extraction data from MongoDB
def load_extraction_data():
    """
    Load all extraction records from MongoDB
    Returns list of records sorted by timestamp (newest first)
    """
    try:
        # Query all records and sort by created_at (newest first)
        records = list(collection.find({}, {'_id': 0}).sort('created_at', -1))
        
        print(f"📊 Loaded {len(records)} records from MongoDB")
        return records
        
    except Exception as e:
        print(f"❌ Error loading data from MongoDB: {str(e)}")
        return []

# 61-70: Update an existing extraction record
def update_extraction_record(record_id, updated_data):
    """
    Update an existing extraction record in MongoDB
    Returns True if successful, False otherwise
    """
    try:
        # Add updated timestamp
        updated_data['updated_at'] = datetime.now()
        
        # Update the record
        result = collection.update_one(
            {'id': record_id},
            {'$set': updated_data}
        )
        
        if result.modified_count > 0:
            print(f"✅ Record {record_id} updated in MongoDB")
            return True
        else:
            print(f"⚠️ Record {record_id} not found in MongoDB")
            return False
            
    except Exception as e:
        print(f"❌ Error updating record in MongoDB: {str(e)}")
        return False

# 71-80: Delete an extraction record
def delete_extraction_record(record_id):
    """
    Delete an extraction record from MongoDB
    Returns True if successful, False otherwise
    """
    try:
        # Delete the record
        result = collection.delete_one({'id': record_id})
        
        if result.deleted_count > 0:
            print(f"✅ Record {record_id} deleted from MongoDB")
            return True
        else:
            print(f"⚠️ Record {record_id} not found in MongoDB")
            return False
            
    except Exception as e:
        print(f"❌ Error deleting record from MongoDB: {str(e)}")
        return False

# 81-90: Get recent extractions
def get_recent_extractions(limit=5, skip=0):
    """
    Get recent extraction records from MongoDB with pagination
    Returns list of most recent records
    """
    try:
        # Query recent records with pagination
        records = list(collection.find({}, {'_id': 0})
                      .sort('created_at', -1)
                      .skip(skip)
                      .limit(limit))
        
        print(f"📊 Retrieved {len(records)} recent records from MongoDB (skip: {skip}, limit: {limit})")
        return records
        
    except Exception as e:
        print(f"❌ Error getting recent records from MongoDB: {str(e)}")
        return []

# 91-100: Check for duplicate records
def is_duplicate_record(name, email, phone):
    """
    Check if a record with similar data already exists in MongoDB
    Returns True if duplicate found, False otherwise
    """
    try:
        # Search for potential duplicates
        query = {
            '$or': [
                {'name': {'$regex': f'^{name}$', '$options': 'i'}},  # Case insensitive name match
                {'email': email.lower()},  # Exact email match
                {'phone': phone}  # Exact phone match
            ]
        }
        
        # Check if any matching record exists
        existing_record = collection.find_one(query)
        
        if existing_record:
            print(f"⚠️ Duplicate record found: {existing_record.get('name', 'Unknown')}")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error checking for duplicates: {str(e)}")
        return False

# 101-120: Label management functions
def create_label(label_name, color="#0891b2"):
    """
    Create a new label for organizing cards
    Returns the created label document
    """
    try:
        label_data = {
            "id": int(time.time() * 1000),
            "name": label_name,
            "color": color,
            "created_at": datetime.now(),
            "card_count": 0
        }
        
        # Insert into labels collection
        labels_collection = collection.database['labels']
        result = labels_collection.insert_one(label_data)
        
        if result.inserted_id:
            print(f"✅ Label '{label_name}' created successfully")
            # Return a clean dictionary without ObjectId
            return {
                "id": label_data["id"],
                "name": label_data["name"],
                "color": label_data["color"],
                "created_at": label_data["created_at"].isoformat(),
                "card_count": label_data["card_count"]
            }
        
        return None
        
    except Exception as e:
        print(f"❌ Error creating label: {str(e)}")
        return None

def get_all_labels():
    """
    Get all available labels
    Returns list of label documents
    """
    try:
        labels_collection = collection.database['labels']
        labels = list(labels_collection.find({}, {'_id': 0}).sort('name', 1))
        return labels
        
    except Exception as e:
        print(f"❌ Error getting labels: {str(e)}")
        return []

def update_label(label_id, label_name, color):
    """
    Update an existing label
    Returns True if successful
    """
    try:
        labels_collection = collection.database['labels']
        result = labels_collection.update_one(
            {'id': label_id},
            {
                '$set': {
                    'name': label_name,
                    'color': color,
                    'updated_at': datetime.now()
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✅ Label {label_id} updated successfully")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error updating label: {str(e)}")
        return False

def delete_label(label_id):
    """
    Delete a label and remove it from all associated cards
    Returns True if successful
    """
    try:
        # First, remove the label from all cards that have it
        cards_result = collection.update_many(
            {'label_id': label_id},
            {
                '$unset': {
                    'label_id': '',
                    'label_name': ''
                },
                '$set': {
                    'is_sorted': False,
                    'updated_at': datetime.now()
                }
            }
        )
        
        # Then delete the label itself
        labels_collection = collection.database['labels']
        label_result = labels_collection.delete_one({'id': label_id})
        
        if label_result.deleted_count > 0:
            print(f"✅ Label {label_id} deleted successfully, {cards_result.modified_count} cards updated")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error deleting label: {str(e)}")
        return False

def update_label_card_count(label_id, count_change):
    """
    Update the card count for a label
    """
    try:
        labels_collection = collection.database['labels']
        labels_collection.update_one(
            {'id': label_id},
            {'$inc': {'card_count': count_change}}
        )
        
    except Exception as e:
        print(f"❌ Error updating label count: {str(e)}")

def assign_label_to_card(record_id, label_id, label_name):
    """
    Assign a label to a card
    Returns True if successful
    """
    try:
        result = collection.update_one(
            {'id': record_id},
            {
                '$set': {
                    'label_id': label_id,
                    'label_name': label_name,
                    'is_sorted': True,
                    'updated_at': datetime.now()
                }
            }
        )
        
        if result.modified_count > 0:
            update_label_card_count(label_id, 1)
            print(f"✅ Label assigned to card {record_id}")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Error assigning label: {str(e)}")
        return False

def remove_label_from_card(record_id):
    """
    Remove label from a card (move to unsorted)
    Returns True if successful
    """
    try:
        # Get current label to update count
        card = collection.find_one({'id': record_id})
        if card and 'label_id' in card:
            update_label_card_count(card['label_id'], -1)
        
        result = collection.update_one(
            {'id': record_id},
            {
                '$unset': {
                    'label_id': '',
                    'label_name': ''
                },
                '$set': {
                    'is_sorted': False,
                    'updated_at': datetime.now()
                }
            }
        )
        
        return result.modified_count > 0
        
    except Exception as e:
        print(f"❌ Error removing label: {str(e)}")
        return False

# 121-140: Card filtering and grouping functions
def get_cards_by_status(is_sorted=None):
    """
    Get cards by sorted status
    Returns list of cards
    """
    try:
        query = {}
        if is_sorted is not None:
            query['is_sorted'] = is_sorted
        
        cards = list(collection.find(query, {'_id': 0}).sort('created_at', -1))
        return cards
        
    except Exception as e:
        print(f"❌ Error getting cards by status: {str(e)}")
        return []

def get_cards_by_label(label_id):
    """
    Get all cards with a specific label
    Returns list of cards
    """
    try:
        cards = list(collection.find(
            {'label_id': label_id}, 
            {'_id': 0}
        ).sort('created_at', -1))
        
        return cards
        
    except Exception as e:
        print(f"❌ Error getting cards by label: {str(e)}")
        return []

def search_cards(query_text):
    """
    Search cards by name, company, email, or phone
    Returns list of matching cards
    """
    try:
        search_query = {
            '$or': [
                {'name': {'$regex': query_text, '$options': 'i'}},
                {'company': {'$regex': query_text, '$options': 'i'}},
                {'email': {'$regex': query_text, '$options': 'i'}},
                {'phone': {'$regex': query_text, '$options': 'i'}},
                {'country': {'$regex': query_text, '$options': 'i'}}
            ]
        }
        
        cards = list(collection.find(search_query, {'_id': 0}).sort('created_at', -1))
        return cards
        
    except Exception as e:
        print(f"❌ Error searching cards: {str(e)}")
        return []

# 141-160: Country detection function
def detect_country_from_company(company_name):
    """
    Simple country detection based on company name patterns
    Returns country code and flag emoji
    """
    country_mapping = {
        # Common patterns for country detection
        'pvt ltd': ('IN', '🇮🇳'),
        'private limited': ('IN', '🇮🇳'), 
        'ltd': ('GB', '🇬🇧'),
        'limited': ('GB', '🇬🇧'),
        'inc': ('US', '🇺🇸'),
        'incorporated': ('US', '🇺🇸'),
        'llc': ('US', '🇺🇸'),
        'corp': ('US', '🇺🇸'),
        'gmbh': ('DE', '🇩🇪'),
        'sarl': ('FR', '🇫🇷'),
        'spa': ('IT', '🇮🇹'),
        'bv': ('NL', '🇳🇱'),
        'ab': ('SE', '🇸🇪'),
        'pty': ('AU', '🇦🇺'),
        'technologies': ('IN', '🇮🇳'),
        'tech': ('US', '🇺🇸'),
        'solutions': ('IN', '🇮🇳'),
        'consulting': ('US', '🇺🇸'),
        'systems': ('US', '🇺🇸'),
        'company name': ('IN', '🇮🇳'),  # For test data
        'your company': ('IN', '🇮🇳'),  # For test data
        'company': ('IN', '🇮🇳')  # Generic fallback for company
    }
    
    if not company_name:
        return 'UNKNOWN', '🌍'
    
    company_lower = company_name.lower()
    
    for pattern, (country_code, flag) in country_mapping.items():
        if pattern in company_lower:
            return country_code, flag
    
    # Default fallback
    return 'UNKNOWN', '🌍'

# 161-200: Image storage and card preview functions
def store_card_with_image(extracted_data, image_bytes, filename):
    """
    Store card data along with image in MongoDB
    Returns the record ID if successful
    """
    try:
        # Convert image to base64
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data_uri = f"data:image/jpeg;base64,{image_base64}"
        
        # Create record with image
        record_id = int(time.time() * 1000)
        record_data = {
            'id': record_id,
            'card_id': str(record_id),  # String version for easier lookup
            'filename': filename,
            'image_base64': image_data_uri,
            'name': extracted_data.get('name', ''),
            'company': extracted_data.get('company', ''),
            'email': extracted_data.get('email', ''),
            'phone': extracted_data.get('phone', ''),
            'website': extracted_data.get('website', ''),
            'designation': extracted_data.get('designation', ''),
            'country': extracted_data.get('country', 'UNKNOWN'),
            'flag': extracted_data.get('flag', '🌍'),
            'is_sorted': extracted_data.get('is_sorted', False),
            'label_id': extracted_data.get('label_id'),
            'label_name': extracted_data.get('label_name'),
            # Event-related fields for company events/meetings
            'event_name': extracted_data.get('event_name', ''),
            'event_description': extracted_data.get('event_description', ''),
            'event_host': extracted_data.get('event_host', ''),
            'event_date': extracted_data.get('event_date', ''),
            'event_location': extracted_data.get('event_location', ''),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Insert into MongoDB
        result = collection.insert_one(record_data)
        
        if result.inserted_id:
            print(f"✅ Card with image stored in MongoDB: {record_id}")
            return record_id
        else:
            print(f"❌ Failed to store card with image")
            return None
            
    except Exception as e:
        print(f"❌ Error storing card with image: {str(e)}")
        return None

def get_card_with_image(card_id):
    """
    Retrieve card data including image by card_id
    Returns complete card document
    """
    try:
        # Try to find by id field first, then by card_id field
        card = collection.find_one({'id': card_id}, {'_id': 0})
        if not card:
            card = collection.find_one({'card_id': str(card_id)}, {'_id': 0})
        
        if card:
            print(f"✅ Retrieved card with image: {card_id}")
            return card
        else:
            print(f"⚠️ Card not found: {card_id}")
            return None
            
    except Exception as e:
        print(f"❌ Error retrieving card: {str(e)}")
        return None

def update_card_data(card_id, updated_fields):
    """
    Update card data while preserving image
    Returns True if successful
    """
    try:
        # Add updated timestamp
        updated_fields['updated_at'] = datetime.now()
        
        # If country is updated, detect flag
        if 'country' in updated_fields or 'company' in updated_fields:
            company = updated_fields.get('company', '')
            if not company:
                # Get existing company if not provided
                existing_card = get_card_with_image(card_id)
                if existing_card:
                    company = existing_card.get('company', '')
            
            country_code, flag = detect_country_from_company(company)
            updated_fields['country'] = country_code
            updated_fields['flag'] = flag
        
        # Update the record
        result = collection.update_one(
            {'id': card_id},
            {'$set': updated_fields}
        )
        
        if result.modified_count > 0:
            print(f"✅ Card data updated: {card_id}")
            return True
        else:
            print(f"⚠️ No changes made to card: {card_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating card data: {str(e)}")
        return False

def get_all_country_flags():
    """
    Get all unique country flags from the database
    Returns list of (country_code, flag) tuples
    """
    try:
        pipeline = [
            {'$group': {'_id': '$country', 'flag': {'$first': '$flag'}}},
            {'$match': {'_id': {'$ne': None, '$ne': ''}}},
            {'$sort': {'_id': 1}}
        ]
        
        results = list(collection.aggregate(pipeline))
        countries = [(result['_id'], result['flag']) for result in results if result['_id'] and result['flag']]
        
        # Add some common countries if not present
        common_countries = [
            ('US', '🇺🇸'), ('IN', '🇮🇳'), ('GB', '🇬🇧'), ('DE', '🇩🇪'), 
            ('FR', '🇫🇷'), ('CA', '🇨🇦'), ('AU', '🇦🇺'), ('JP', '🇯🇵'),
            ('CN', '🇨🇳'), ('BR', '🇧🇷'), ('UNKNOWN', '🌍')
        ]
        
        existing_codes = [c[0] for c in countries]
        for code, flag in common_countries:
            if code not in existing_codes:
                countries.append((code, flag))
        
        return sorted(countries, key=lambda x: x[0] or '')
        
    except Exception as e:
        print(f"❌ Error getting country flags: {str(e)}")
        return [('UNKNOWN', '🌍')]
