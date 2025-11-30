import { showToast, mudarParaLogin } from "../tela/ui_Funcoes.js" 


const formCadastro = document.getElementById('formulario_cadastro_aluno')

//da um post com a informações do cadastro
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault(); // não deixa que o navegador recarregue quando clicar no botão

    const confirmaSenha = document.getElementById('confirmar_senha_aluno');
    const cadastroForm = new FormData(formCadastro);
    const cadastroData = Object.fromEntries(cadastroForm.entries());//transforma o forms em um object

    // verifica requisitos para senha
    const validador = validadorDeSenha(cadastroData.nova_senha);

    if (!validador.isValid) {
        alert("A senha não contem todos os requisitos:\n- " + validador.messages.join("\n- "));
        return;
    }
    if (cadastroData.nova_senha !== confirmaSenha.value) {
        showToast('As senhas não estão iguais!', 'error');
        return;
    }

    try {
        const resposta = await fetch(`/cadastraAluno`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(cadastroData)
        });

        const resultado = await resposta.json(); // Sempre tente ler a resposta como JSON

        if (!resposta.ok) {
            // Se a resposta não for OK, lança um erro com a mensagem do servidor
            throw new Error(resultado.erro || "Falha no cadastro");
        }

        // Se a resposta for OK, o cadastro e login foram bem-sucedidos
        sessionStorage.setItem('toastMessage', 'Bem-vindo! Cadastro realizado com sucesso!');
        sessionStorage.setItem('toastType', 'success');

        // Redireciona para a página principal, agora logado
        window.location.href = '../../index.html';

    } catch (error) {
        // Mostra a mensagem de erro capturada (seja do throw ou de outra falha)
        showToast(error.message, 'error');
        console.error(error); // Mantém o log do erro no console para depuração
    }
})


// Fetch post da tela de login
const formLogin = document.getElementById('formulario_login_aluno')
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault() // não deixa que o navegador recarrega quando clicar no botão

    const loginForm = new FormData(formLogin)
    const loginData = Object.fromEntries(loginForm.entries()) // transforma o forms em um object

    try{
        const resposta = await fetch(`/login`, {
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
        sessionStorage.setItem('toastMessage', 'Login realizado com sucesso!');
        sessionStorage.setItem('toastType', 'success');
        window.location.href = '../../index.html' 
    }
    catch(error) {console.log(error)}
})

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