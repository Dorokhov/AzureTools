@echo off

echo "Build AzureTools for Chrome"

call npm install -g browserify
IF %ERRORLEVEL% NEQ 0 goto ERROR

call npm install grunt-browserify
IF %ERRORLEVEL% NEQ 0 goto ERROR

call npm install -g grunt-cli
IF %ERRORLEVEL% NEQ 0 goto ERROR

call grunt
IF %ERRORLEVEL% NEQ 0 goto ERROR

echo "Build has finished with success..."
pause
exit

:ERROR
echo "Build has finished with error!"
pause