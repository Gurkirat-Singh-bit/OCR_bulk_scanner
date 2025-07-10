@echo off
REM === OCR Scanner Local Setup Script for Windows ===

REM 1. Create virtual environment if not exists
if not exist venv (
    python -m venv venv
)

REM 2. Activate virtual environment
call venv\Scripts\activate

REM 3. Install requirements
pip install -r requirements_local.txt

REM 4. Prompt for API key and save to .env
if not exist .env (
    set /p APIKEY="Enter your Google Gemini API Key: "
    echo GEMINI_API_KEY=%APIKEY%> .env
)

REM 5. Check for MongoDB installation
where mongod >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo MongoDB is not installed. Please install MongoDB Community Edition from https://www.mongodb.com/try/download/community and ensure 'mongod' is in your PATH.
    pause
    exit /b
)

REM 6. Start MongoDB (if not already running)
start "MongoDB" cmd /c "mongod --dbpath %cd%\data --bind_ip 127.0.0.1"

REM 7. Wait a few seconds for MongoDB to start
ping 127.0.0.1 -n 5 >nul

REM 8. Start the Flask app and open browser
start "OCR Scanner" cmd /c "call venv\Scripts\activate && python main.py && pause"
start http://127.0.0.1:5000

echo Setup complete. You can now use the OCR Scanner locally!
pause
