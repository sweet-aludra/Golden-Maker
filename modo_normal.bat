@echo off
echo Ligando o servidor em MODO APRESENTACAO...
echo Nao feche esta janela.

:: Define a variavel MODO_APP como 'publico'
set MODO_APP=publico

:: Inicia o servidor
node src/server.js

pause