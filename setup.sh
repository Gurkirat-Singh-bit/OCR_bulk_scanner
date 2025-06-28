#!/bin/bash

# OCR Scanner Flask App Setup Script
echo "Setting up OCR Scanner Flask Application..."

# Install system dependencies (Ubuntu/Debian)
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y tesseract-ocr tesseract-ocr-eng python3-pip

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Alternative: Install with uv (if using uv package manager)
# uv sync

echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Ensure Tesseract OCR is installed on your system"
echo "2. Run: python main.py"
echo "3. Open your browser to http://localhost:5000"
echo ""
echo "Note: For Windows users, you may need to:"
echo "1. Install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki"
echo "2. Update the tesseract path in app/ocr.py if needed"
