// Variável para guardar o arquivo selecionado
let arquivoSelecionado = null;
// import do showToast
import { showToast } from "../tela/ui_Funcoes.js" 

// Elementos do DOM
const botaoEditar = document.querySelector('[data-action="menuEditar"]');
const modal = document.getElementById('modalEditarFoto');
const previewImg = document.getElementById('previewNovaFoto');
const inputFoto = document.getElementById('inputNovaFoto');
const btnCancelar = document.getElementById('btnCancelarEdicao');
const btnConfirmar = document.getElementById('btnConfirmarEdicao');
const fotoPrincipalDoPerfil = document.querySelector('[data-action="trocarFoto"]');

// 1. Abrir o modal
botaoEditar.addEventListener('click', () => {
    modal.style.display = 'flex';
    // Garante que o preview comece com a foto atual do perfil
    previewImg.src = fotoPrincipalDoPerfil.src;
});

// 2. Fechar o modal
btnCancelar.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 3. Clicar na imagem de preview abre o seletor de arquivos
previewImg.addEventListener('click', () => {
    inputFoto.click();
});

// 4. Quando um arquivo é selecionado, mostra o preview
inputFoto.addEventListener('change', (event) => {
    const arquivo = event.target.files[0];
    if (arquivo) {
        arquivoSelecionado = arquivo;
        const reader = new FileReader();
        reader.onload = (e) => {
            // Atualiza a imagem de preview no modal
            previewImg.src = e.target.result;
        };
        reader.readAsDataURL(arquivo);
    }
});

// 5. Enviar a nova foto para o servidor
btnConfirmar.addEventListener('click', async () => {
    if (!arquivoSelecionado) {
        showToast('Você precisa selecionar uma nova imagem primeiro!', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('fotoPerfil', arquivoSelecionado); // 'fotoPerfil' é o nome que o backend espera

    try {
        const resposta = await fetch('/trocarfoto', {
            method: 'POST',
            body: formData,
            credentials: 'include' // Essencial para enviar o cookie de sessão
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Falha ao trocar a foto.');
        }

        showToast(resultado.message, 'success');

        // Atualiza a foto principal na página
        fotoPrincipalDoPerfil.src = previewImg.src;
        modal.style.display = 'none'; // Fecha o modal
        arquivoSelecionado = null; // Limpa a seleção

    } catch (error) {
        console.error('Erro ao trocar foto:', error);
        alert(error.message);
    }
});




//mudar nome
const formNovoNome = document.getElementById('campo_novo_nome');
const inputNovoNome = document.getElementById('nick');
const nicknameDisplay = document.querySelector('[data-action="trocarNome"]')

// Adiciona um evento de 'submit' ao formulário
formNovoNome.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o recarregamento padrão da página

    const novoNome = inputNovoNome.value;

    // Validação no frontend: se o campo estiver vazio, não faz nada
    if (!novoNome || novoNome.trim() === '') {
        showToast('O campo de novo nick não pode estar vazio.', 'error')
        return
    }

    try {
        const resposta = await fetch('/trocarnome', {
            method: 'PUT', // Usando o método PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ novoNome: novoNome }),
            credentials: 'include' // Essencial para enviar a sessão
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Falha ao atualizar o nome.');
        }

        showToast(resultado.message, 'success')        

        // Atualiza o nome exibido na tela
        nicknameDisplay.textContent = `@${resultado.novoNome}`;
        inputNovoNome.value = ''; // Limpa o campo do input

    } catch (error) {
        console.error("Erro ao trocar nome:", error);
        alert(error.message);
    }
});