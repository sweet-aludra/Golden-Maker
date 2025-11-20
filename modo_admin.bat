@echo off
:: Define a variavel MODO_APP como 'admin'
set MODO_APP=admin

:: Inicia o servidor
node src/server.js
echo Mantenha esta janela aberta.

pause