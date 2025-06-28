# 1-10: Importing modules
from flask import Flask  # Import Flask framework
import os  # Import OS module for file operations
from dotenv import load_dotenv  # Import dotenv for environment variables

# Load environment variables from .env file
load_dotenv()

# 11-20: Flask app factory function
def create_app():
    """
    Application factory pattern - creates and configures Flask app instance
    """
    # Initialize Flask application
    app = Flask(__name__)
    
    # 21-30: Configuring Flask app settings
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ocr-scanner-secret-key-2025')  # Secret key for sessions and CSRF protection
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'static/uploads')  # Directory to store uploaded images
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # Limit file uploads to 16MB
    
    # 31-40: Creating upload directory if it doesn't exist
    upload_dir = os.path.join(app.instance_path, '..', app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_dir, exist_ok=True)  # Create uploads directory
    
    # 41-50: Registering blueprints
    from app.routes import main_bp  # Import main blueprint from routes
    app.register_blueprint(main_bp)  # Register the main blueprint with the app
    
    return app  # Return configured Flask app instance