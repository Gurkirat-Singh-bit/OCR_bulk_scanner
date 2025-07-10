#!/bin/bash
# === OCR Scanner Local Setup Script for Linux ===

# 1. Create virtual environment if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 2. Activate virtual environment
source venv/bin/activate

# 3. Install requirements
pip install -r requirements_local.txt

# 4. Prompt for API key and save to .env
if [ ! -f .env ]; then
    read -p "Enter your Google Gemini API Key: " APIKEY
    echo "GEMINI_API_KEY=$APIKEY" > .env
fi

# 5. Check for MongoDB installation
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Please install MongoDB (https://www.mongodb.com/try/download/community) and ensure 'mongod' is in your PATH."
    exit 1
fi

# 6. Start MongoDB (if not already running)
mkdir -p data
pgrep mongod > /dev/null || (mongod --dbpath "$PWD/data" --bind_ip 127.0.0.1 &)

# 7. Wait a few seconds for MongoDB to start
sleep 5

# 8. Start the Flask app and open browser
( python main.py & )
sleep 2
xdg-open http://127.0.0.1:5000

echo "Setup complete. You can now use the OCR Scanner locally!"
read -p "Press enter to exit..."
