@echo off
REM ============================================================
REM   Home Credit Dashboard - FIXED launcher (no install needed)
REM   Uses the bundled .venv packages via your local Python 3.12,
REM   bypassing the broken uv trampoline .exe files.
REM ============================================================
setlocal
cd /d "%~dp0"
set "PY=C:\Users\ASUS\AppData\Local\Programs\Python\Python312\python.exe"
set "PYTHONPATH=%~dp0.venv\Lib\site-packages"
echo Starting dashboard at http://localhost:8501 ...
echo Keep THIS window open. Press Ctrl+C to stop.
"%PY%" -m streamlit run dashboard\app.py
pause
