::npm-install.bat
@echo off
::install web server dependencies && logic server dependencies
cd web-server && npm install -d && cd .. && cd logic-server && npm install -d