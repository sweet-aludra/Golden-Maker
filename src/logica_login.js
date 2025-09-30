const url = 'http://localhost:3000'

async function verificarStatusdoLogin() {
    try {
        const resposta = await fetch(`${url}/logininfo`)

        if (!resposta.ok) {
            console.log('usuario não esta logado')
        }
        const dados = await resposta.json
        const usuariodados = dados.usuario
    }
    catch (err) {
        console.log('error ao verificar status login', error)
    }
}

//document.addEventListener('DOMContentLoaded', verificarStatusLogin) para acionar assim que a pagina iniciar