# 1-10: Importing modules
import os
import time
from datetime import datetime
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

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
def get_recent_extractions(limit=5):
    """
    Get recent extraction records from MongoDB
    Returns list of most recent records
    """
    try:
        # Query recent records
        records = list(collection.find({}, {'_id': 0})
                      .sort('created_at', -1)
                      .limit(limit))
        
        print(f"📊 Retrieved {len(records)} recent records from MongoDB")
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
