# OCR Scanner Flask Application

A Flask web application that extracts structured data (Name, Email, Phone, Company) from visiting card images using Tesseract OCR and saves the results to a CSV file.

## Features

- 📁 **Multiple File Upload**: Upload one or multiple visiting card images
- 🔍 **OCR Processing**: Extract text using Tesseract OCR with image preprocessing
- 📊 **Data Extraction**: Automatically extract Name, Email, Phone, and Company information
- 💾 **CSV Export**: Save extracted data to `output.csv` file
- 🎨 **Web Interface**: User-friendly upload interface
- 🔒 **File Validation**: Secure file handling and validation
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## Project Structure

```
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── routes.py            # All app routes (upload, results)
│   ├── ocr.py               # OCR logic (Tesseract-based)
│   ├── utils.py             # Helper functions (file save, validation)
│
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── uploads/             # Temp image store (auto-created)
│
├── templates/
│   ├── index.html           # File upload UI
│   └── results.html         # Parsed OCR display
│
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
├── pyproject.toml          # Project configuration
└── .env                    # Environment variables
```

## Installation

### Prerequisites

1. **Python 3.12+**
2. **Tesseract OCR**
   - **Ubuntu/Debian**: `sudo apt install tesseract-ocr tesseract-ocr-eng`
   - **macOS**: `brew install tesseract`
   - **Windows**: Download from [Tesseract GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

### Setup Steps

1. **Clone or download the project**
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   Or if using `uv`:
   ```bash
   uv sync
   ```

3. **Run the setup script** (Linux/Mac):
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## Usage

1. **Start the Flask server**:
   ```bash
   python main.py
   ```

2. **Open your browser** to `http://localhost:5000`

3. **Upload visiting card images**:
   - Select one or multiple image files (PNG, JPG, JPEG, etc.)
   - Click upload to process

4. **View results**:
   - Extracted data is saved to `output.csv`
   - Check the web interface for processing status

## API Endpoints

- `GET /` - Main upload page
- `POST /upload` - Process uploaded files
- `GET /results` - View extracted results
- `POST /api/upload` - JSON API for file upload

## Configuration

### Environment Variables (.env)

```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key
UPLOAD_FOLDER=static/uploads
MAX_CONTENT_LENGTH=16777216
```

### Tesseract Configuration

For Windows users, you may need to specify the Tesseract path in `app/ocr.py`:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Data Extraction

The application extracts the following information:

- **Name**: First line of detected text
- **Email**: Email addresses using regex pattern matching
- **Phone**: Phone numbers (supports various formats including +91)
- **Company**: Detected using company keywords or longest remaining text line

## Output Format

Data is saved to `output.csv` with the following columns:

```csv
name,email,phone,company
John Doe,john@company.com,+919876543210,ABC Company Ltd
```

## Troubleshooting

1. **Tesseract not found**: Ensure Tesseract is installed and in PATH
2. **Poor OCR results**: Images should be clear with good contrast
3. **Upload errors**: Check file size limits and supported formats
4. **Permission errors**: Ensure write permissions for uploads and CSV file

## Dependencies

- Flask 3.0.0+ - Web framework
- pytesseract 0.3.10+ - OCR wrapper
- opencv-python 4.8.1+ - Image processing
- Pillow 10.1.0+ - Image handling
- numpy 1.24.3+ - Array operations
- Werkzeug 3.0.1+ - WSGI utilities

## License

This project is open source and available under the MIT License.
