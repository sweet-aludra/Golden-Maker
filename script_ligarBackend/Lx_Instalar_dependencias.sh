#!/bin/bash

# volta para a raiz do projeto
cd "$(dirname "$0")"
cd ..

# carrega o NVM forçadamente 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# verifica se o Node está baixado
if ! command -v npm &> /dev/null
then
    echo "ERRO: Node.js não encontrado!"
    echo "Por favor, instale o NVM e o Node js antes de rodar este script."
    echo "Instruções no README.md"
    read -p "Pressione Enter para sair..."
    exit
fi

# comando de instalação
echo "instalando as dependências"
npm install

echo "--- Tudo pronto! ---"
read -p "Pressione Enter para fechar"