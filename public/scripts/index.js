const url = 'http://localhost:3000'

// função que ativa quando a pagina abrir
document.addEventListener('DOMContentLoaded', async () => {


    const fotoJogoCarrosel = document.getElementById('mostrarTela') //pega o id do elemento imagem do index.html

    const anoProjeto = '2025' //isso vai vir do filtro da tela inicial
    const nomeProjeto = 'JogoKatana' //nome da pasta, isso vai vim do banco
    const arquivosnoProjeto = 'katanaZeroImagem.jpg' // não sera so 1 arquivo
    fotoJogoCarrosel.src = `/pasta_projeto/${anoProjeto}/${nomeProjeto}/${arquivosnoProjeto}`
    // e dai isso forma o caminho da imagem

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
            fotomostrar.src = `/upload/${usuariodados.foto}`
        }
        
    }
    catch (err) {
        console.log('error ao verificar status login', err)
    }
})