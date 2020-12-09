CreateObject("Wscript.Shell").Run "npm start", 0
CreateObject("Wscript.Shell").Run "python src\weather-api.py", 0 
CreateObject("Wscript.Shell").Run "python src\flask-api.py", 0 
CreateObject("Wscript.Shell").Run """C:\Program Files\Mozilla Firefox\firefox.exe"" localhost:3000"
