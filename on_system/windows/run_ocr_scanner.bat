@echo off
REM === OCR Scanner Local App Launcher for Windows ===
REM This script assumes setup_local.bat has already been run at least once.

REM 1. Activate virtual environment
call venv\Scripts\activate

REM 2. Start MongoDB (if not already running)
start "MongoDB" cmd /c "mongod --dbpath %cd%\data --bind_ip 127.0.0.1"

REM 3. Wait a few seconds for MongoDB to start
ping 127.0.0.1 -n 5 >nul

REM 4. Start the Flask app and open browser
start "OCR Scanner" cmd /c "call venv\Scripts\activate && python main.py && pause"
start http://127.0.0.1:5000
