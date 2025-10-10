const url = 'http://localhost:3000'

// função que ativa quando a pagina abrir
document.addEventListener('DOMContentLoaded', async () => {

    const nomeMostrar = document.querySelector('[data-action="trocarNome"]')
    const fotoMostrar = document.querySelector('[data-action="trocarFoto"]')

    try {
        const resposta = await fetch(`${url}/logininfo`,{
            credentials: 'include' // adiciona os dados do cookie na requisição
        }) 
        if (!resposta.ok) {
            console.log('usuario não está logado')
            return
        }
        else {        
            const dados = await resposta.json()
            const usuarioDados = dados.usuario

            nomeMostrar.textContent = usuarioDados.nome
            fotoMostrar.src = `/upload/${usuarioDados.foto}`
        }
    }catch (err) {
        console.log('error ao tentar verificar status de login', err)
    }
})

import { showToast } from "./ui_Funcoes.js"

document.addEventListener('DOMContentLoaded', () => {
    // Pega a mensagem e o tipo do sessionStorage
    const message = sessionStorage.getItem('toastMessage');
    const type = sessionStorage.getItem('toastType');

    // Se uma mensagem existir...
    if (message) {
        // ...mostre o toast!
        showToast(message, type);

        // IMPORTANTE: Limpe os dados para o toast não aparecer de novo
        // se o usuário recarregar a página.
        sessionStorage.removeItem('toastMessage');
        sessionStorage.removeItem('toastType');
    }
});