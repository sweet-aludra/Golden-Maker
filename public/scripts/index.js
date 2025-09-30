//função de ver se ta logado

const url = 'http://localhost:3000'

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resposta = await fetch(`${url}/logininfo`,{
            credentials: 'include'
        }) 

        if (!resposta.ok) {
            console.log('usuario não esta logado')
            return
        }
        const dados = await resposta.json()
        const usuariodados = dados.usuario

        const nomemostrar = document.getElementById('mostrarNome')
        const fotomostrar = document.getElementById('imagemPerfil')

        if (nomemostrar) {
            nomemostrar.textContent = usuariodados.nome
        }
        if (fotomostrar && usuariodados.foto) {
            fotomostrar.src = ``
            fotomostrar.src = `/upload/${usuariodados.foto}`
        }
        
    }
    catch (err) {
        console.log('error ao verificar status login', err)
    }
})