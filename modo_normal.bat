@echo off
:: Define a variavel MODO_APP como 'publico'
set MODO_APP=publico

:: Inicia o servidor
node src/server.js
echo Mantenha esta janela aberta.

pause