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
    # Get the absolute path to the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Initialize Flask application with explicit template and static paths
    app = Flask(__name__, 
                template_folder=os.path.join(project_root, 'templates'),
                static_folder=os.path.join(project_root, 'static'))
    
    # 21-30: Configuring Flask app settings
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ocr-scanner-secret-key-2025')  # Secret key for sessions and CSRF protection
    app.config['UPLOAD_FOLDER'] = os.path.join(project_root, 'static', 'uploads')  # Absolute path to upload directory (for temporary files only)
    # Removed MAX_CONTENT_LENGTH to allow bulk upload of many files
    
    # 31-40: Creating required directories if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)  # Create uploads directory with absolute path (for temporary files)
    # Removed results folder creation as all data is now stored in MongoDB
    
    # 41-50: Registering blueprints
    from app.routes import main_bp  # Import main blueprint from routes
    app.register_blueprint(main_bp)  # Register the main blueprint with the app
    
    return app  # Return configured Flask app instance