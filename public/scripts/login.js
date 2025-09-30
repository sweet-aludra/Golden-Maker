const url = 'http://localhost:3000'//o caminho do server 


//da um post com a informações do cadastro
const formCadastro = document.getElementById('formulario_cadastro')
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault()//não deixa que o navegador recarrega quando clicar no botão

    const cadastroForm = new FormData(formCadastro)
    const cadastroData = Object.fromEntries(cadastroForm.entries())//transforma o forms em um object

    const confirmarSenhaInput = document.getElementById('confirmar')

    if (cadastroData.nova_senha !== confirmarSenhaInput.value) { 
    alert('As senhas não coincidem!');
    return;
}

    try{
        const resposta = await fetch(`${url}/items`, {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(cadastroData)
        })
        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro no servidor:${erroTexto}`);
        }
        const mensagemSucesso = await resposta.text();
        console.log(mensagemSucesso);
        alert('Cadastro Salvo');
        formCadastro.reset();
    }
    catch(error) {console.log(error)}
})
//tela de login sera usado
const formLogin = document.getElementById('formulario_login')
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault()//não deixa que o navegador recarrega quando clicar no botão

    const loginForm = new FormData(formLogin)
    const loginData = Object.fromEntries(loginForm.entries())//transforma o forms em um object

    try{
        const resposta = await fetch(`${url}/login`, {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(loginData),
            credentials: 'include'
        })
        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro no servidor:${erroTexto}`);
        }
        console.log(await resposta.text());
        alert('Login Verificado');
        window.location.href = '../index.html' 
    }
    catch(error) {console.log(error)}
})

//botão de sair
const botaoLogout = document.getElementById('logout');
if (botaoLogout) {
    botaoLogout.addEventListener('click', async () => {
        try {
            await fetch(`${url}/logout`, { method: 'POST', credentials: 'include'});
            alert('Você saiu com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    });
}


//logica de mostrar banco na tela dps tirar

// //botão de mostrar o banco na tela n sera usado em teoria
// const atualizarMostrar = document.getElementById('atualizar')
// atualizarMostrar.addEventListener('click', async (event) => {
//     try{
//         const resposta = await fetch(`${url}/items`, {
//             method:'GET',
//             credentials: 'include'
//         })
//         if (!resposta.ok) {
//             const erroTexto = await resposta.text();
//             throw new Error(`Erro no servidor:${erroTexto}`);
//         }

//         const dados = await resposta.json()

//         const botaoMostrar = document.getElementById('banco_info')
//         botaoMostrar.innerHTML = JSON.stringify(dados)
//     }
//     catch(error) {console.log(error)}  
// })