@echo off
echo Ligando o servidor em MODO ADMIN...
echo Nao feche esta janela.

:: Define a variavel MODO_APP como 'admin'
set MODO_APP=admin

:: Inicia o servidor
node src/server.js

pause