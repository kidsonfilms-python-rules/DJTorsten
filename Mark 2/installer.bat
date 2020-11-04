ECHO OFF
WHERE wget
IF %ERRORLEVEL% NEQ 0 (
    ECHO Python wasn't found
    ECHO Installing Python 3.8.2
    md "C:\Program Files\testPy"
    xcopy /s/e/h/y/z "c:\Users\Siddharth Ray\Desktop\Project DJTorsten\Python38" "C:\Program Files\testPy"
    REM ECHO Setting Python Enviroment Varible
    REM SET PATH=%PATH%;"C:\Program Files\testPy\"
    
    
) 

cd "C:\Users\Siddharth Ray\Desktop\Project DJTorsten"
ECHO Installing Requirements
pip install -r requirements.txt
pip install Eel
pip install random2

PAUSE
