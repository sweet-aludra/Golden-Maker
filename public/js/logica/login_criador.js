import { showToast, mudarParaLogin } from "../tela/ui_Funcoes.js"

// Cadastro
const formCadastro = document.getElementById('formulario_cadastro_criador');
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();
    const confirmaSenha = document.getElementById('confirmar_senha_criador').value;
    const novaSenha = document.getElementById('senha_criador2').value;

    if (novaSenha !== confirmaSenha) {
        return showToast('As senhas não são iguais!', 'error');
    }

    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/cadastraCriador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.erro || 'Ocorreu um erro no cadastro.');
        }

        sessionStorage.setItem('toastMessage', 'Bem-vindo! Seu cadastro de criador foi realizado com sucesso!');
        sessionStorage.setItem('toastType', 'success');
        
        window.location.href = '/index.html';

    } catch (error) {
        showToast(error.message, 'error');
        console.error(error);
    }
});

// Login
const formLogin = document.getElementById('formulario_login_criador')
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(formLogin)
    const data = {
        email: formData.get('email_criador'),
        senha: formData.get('senha')
    };

    try {
        const response = await fetch(`/loginCriador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        if (!response.ok) {
            throw new Error('Email ou senha inválidos')
        }
        sessionStorage.setItem('toastMessage', 'Login de criador realizado com sucesso!');
        sessionStorage.setItem('toastType', 'success');
        window.location.href = '/index.html'
    } catch (error) {
        showToast(error.message, 'error')
    }
})