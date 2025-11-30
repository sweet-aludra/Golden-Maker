#!/bin/bash
# As linhas abaixo garantem que o Node (NVM) seja encontrado
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Iniciando Golden Maker (MODO ADMIN)..."
npm run app:admin