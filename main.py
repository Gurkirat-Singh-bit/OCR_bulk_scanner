# 1-10: Importing modules
from app import create_app  # Import the Flask app factory function

# 11-20: Initializing Flask app
app = create_app()  # Create Flask app instance using factory pattern

# 21-30: Running the server
if __name__ == '__main__':
    # Run the Flask development server with debug mode enabled
    app.run(debug=True, host='0.0.0.0', port=5002)
