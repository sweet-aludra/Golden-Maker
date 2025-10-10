const url = 'http://localhost:3000'//o caminho do server 

import { showToast, mudarParaLogin } from "../tela/ui_Funcoes.js" 


const formCadastro = document.getElementById('formulario_cadastro_aluno')

//da um post com a informações do cadastro
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault() // não deixa que o navegador recarrega quando clicar no botão

    const confirmaSenha = document.getElementById('confirmar_senha_aluno')
    const login = document.getElementById("login");
    const cadastro = document.getElementById("cadastro");

    const cadastroForm = new FormData(formCadastro)
    const cadastroData = Object.fromEntries(cadastroForm.entries())//transforma o forms em um object

    // verifica requisitos para senha
    const validador = validadorDeSenha(cadastroData.nova_senha)

    if (!validador.isValid) {
        alert("A senha não contem todos os requisitos:\n- " + validador.messages.join("\n- "))
        //tentativa de colocar no toast
        //showToast("A senha não contem todos os requisitos:\n- " + validador.messages.join("\n- "), 'error', )
        return 
    }
    if (cadastroData.nova_senha !== confirmaSenha.value) { 
        showToast('As senhas não estão iguais!', 'error');
        return
    }

    try{
        const resposta = await fetch(`${url}/cadastraAluno`, {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(cadastroData)
        })
        if (!resposta.ok) {
            const erroObjeto = await resposta.json();
            const mensagemDeErro = erroObjeto.erro

            showToast(mensagemDeErro, 'error')
            throw new Error(`Erro no servidor:${erroTexto}`)
        }else{
            const mensagemSucesso = await resposta.text()
            console.log(mensagemSucesso)
            mudarParaLogin(login, cadastro) // muda a tela para aparecer o login
            showToast('Cadastro realizado com sucesso!', 'success');
            formCadastro.reset()
        }

    }
    catch(error) {console.log(error)}
})


// Fetch post da tela de login
const formLogin = document.getElementById('formulario_login_aluno')
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault() // não deixa que o navegador recarrega quando clicar no botão

    const loginForm = new FormData(formLogin)
    const loginData = Object.fromEntries(loginForm.entries()) // transforma o forms em um object

    try{
        const resposta = await fetch(`${url}/login`, {
            method:'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(loginData),
            credentials: 'include'
        })
        if (!resposta.ok) {
            const erroTexto = await resposta.text()
            showToast('Essa combinação de Email/Senha não funcionaram', 'error');
            throw new Error(`Erro no servidor:${erroTexto}`)
        }
        console.log(await resposta.text());
        sessionStorage.setItem('toastMessage', 'Login realizado com sucesso!');
        sessionStorage.setItem('toastType', 'success');
        window.location.href = '../../index.html' 
    }
    catch(error) {console.log(error)}
})



// tirar esse botão dessa tela

// botão de sair ainda não implementado
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



function validadorDeSenha(senha) {
    const requirements = []
    if (senha === "123") { // senha mestre
        return { isValid: true, messages: [] };
    }

    // verifica comprimento
    if (senha.length < 6) { 
        requirements.push("Senha deve conter pelo menos 7 caracteres de comprimento");
    }
    // verifica letra maiuscula
    if (!/[A-Z]/.test(senha)) { // usa regex para verificar cadeia de digitos
        requirements.push("Senha deve conter pelo menos 1 letra maiuscula");
    }
    // verifica se contem pelo menos 1 digito
    if (!/\d/.test(senha)) {
        requirements.push("Senha deve conter pelo menos 1 digito");
    }
    // verifica se contem um caracter especial desses aq (!@#$%^&*)
    if (!/[!@#$%^&*]/.test(senha)) {
        requirements.push("Senha deve conter pelo menos 1 dos seguintes caracteres (!@#$%^&*)");
    }
    // retorna verdadeiro caso tenha todos na senha, caso n ele volta falso com oq faltou
    if (requirements.length === 0) {
        return { isValid: true, messages: [] };
    } else {
        return { isValid: false, messages: requirements };
    }
}

// function validadorDeNick(nick) {
//     const requirements = []
//     if (nick === "123") { // nick mestre
//         return { isValid: true, messages: [] };
//     }

//     // verifica comprimento
//     if (nick.length < 3 || nick.length > 64)  { 
//         requirements.push("Nick não pode menos de 3 caracteres ou maximo de 64");
//     }
//     // verifica se a primeira letra e
//     if (nick.length < 6 || nick.length > 64)  { 
//         requirements.push("Nick não pode menos de 3 caracteres ou maximo de 64");
//     }
//     // retorna verdadeiro caso tenha todos na senha, caso n ele volta falso com oq faltou
//     if (requirements.length === 0) {
//         return { isValid: true, messages: [] };
//     } else {
//         return { isValid: false, messages: requirements };
//     }
// }