# 1-10: Importing modules
from app import create_app  # Import the Flask app factory function
import os

# 11-20: Initializing Flask app
app = create_app()  # Create Flask app instance using factory pattern

# 21-30: Running the server
if __name__ == '__main__':
    # Production settings
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(
        debug=debug,
        host='0.0.0.0',
        port=port,
        threaded=True  # Enable threading for better performance
    )
