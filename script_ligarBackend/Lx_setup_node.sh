#!/bin/bash

echo "--- Configurando node js ---"

# Atualiza o Linux e instala o curl (necessário para baixar o NVM)
# O 'sudo' vai pedir a senha aqui
echo "> Atualizando sistema e instalando dependências básicas..."
sudo apt update && sudo apt install -y curl

# Baixa e roda o instalador do NVM
echo "> Baixando e instalando NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carrega o NVM imediatamente para esta sessão
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instala a versão LTS do Node.js
echo "> Instalando a versão LTS do Node.js..."
nvm install --lts

# Define como padrão
nvm alias default lts/*

echo "Node.js instalado."
echo "Versão instalada:"
node -v
echo "IMPORTANTE: Feche este terminal e abra um novo para garantir que tudo funcione."
read -p "Pressione Enter para sair"