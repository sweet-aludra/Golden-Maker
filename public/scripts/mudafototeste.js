const url = 'http://localhost:3000'

const formNewFoto = document.getElementById('mudarfoto')

formNewFoto.addEventListener('submit', async (event) => {
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

        const email = usuariodados.email

        const fileInput = document.getElementById('batata')
        const file = fileInput.files[0]


        try{
            const respota = await fetch(`${url}/mudarfoto`, {
                method: 'POST',
                body: email, file
            })
        }    
        catch (err) {
            console.log('error ao mudar a foto', err)
        }

    }
    catch (err) {
        console.log('error ao verificar status login', err)
    }
})