// função que ativa quando a pagina abrir
document.addEventListener('DOMContentLoaded', async () => {

    const nomeMostrar = document.querySelector('[data-action="trocarNome"]')
    const fotoMostrar = document.querySelector('[data-action="trocarFoto"]')
    const botaoPublicar = document.getElementById('botao_publicar')

    try {
        const resposta = await fetch(`/logininfo`,{
            credentials: 'include' // adiciona os dados do cookie na requisição
        }) 
        if (!resposta.ok) {
            if (botaoPublicar) botaoPublicar.style.display = 'none'
            return
        }
        else {        
            const dados = await resposta.json()
            const usuarioDados = dados.usuario

            if (nomeMostrar) nomeMostrar.textContent = usuarioDados.nome
            if (fotoMostrar) fotoMostrar.src = `/${usuarioDados.foto}`

            // Lógica para mostrar/esconder o botão
            if (botaoPublicar) {
                if (usuarioDados.tipo === 'criador') {
                    botaoPublicar.style.display = 'block' // Mostra para criadores
                } else {
                    botaoPublicar.style.display = 'none' // Esconde para outros
                }
            }

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
})