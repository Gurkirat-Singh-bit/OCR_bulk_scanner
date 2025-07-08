# 1-10: Importing modules
from flask import Flask  # Import Flask framework
import os  # Import OS module for file operations
import logging
from logging.handlers import RotatingFileHandler
from .config import config

# 11-20: Flask app factory function
def create_app(config_name=None):
    """
    Application factory pattern - creates and configures Flask app instance
    """
    # Get the absolute path to the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Initialize Flask application with explicit template and static paths
    app = Flask(__name__, 
                template_folder=os.path.join(project_root, 'templates'),
                static_folder=os.path.join(project_root, 'static'))
    
    # 21-30: Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])
    
    # Ensure absolute paths for upload folders
    if not os.path.isabs(app.config['UPLOAD_FOLDER']):
        app.config['UPLOAD_FOLDER'] = os.path.join(project_root, app.config['UPLOAD_FOLDER'])
    if not os.path.isabs(app.config['RESULTS_FOLDER']):
        app.config['RESULTS_FOLDER'] = os.path.join(project_root, app.config['RESULTS_FOLDER'])
    
    # 31-40: Creating required directories if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)  # Create uploads directory
    os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)  # Create results directory
    
    # Configure logging for production
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            'logs/ocr_scanner.log', 
            maxBytes=10240000, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('OCR Scanner startup')
    
    # 41-50: Registering blueprints
    from app.routes import main_bp  # Import main blueprint from routes
    app.register_blueprint(main_bp)  # Register the main blueprint with the app
    
    return app  # Return configured Flask app instance