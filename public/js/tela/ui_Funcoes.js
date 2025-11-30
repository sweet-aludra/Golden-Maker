export function mudarParaCadastro (loginElement, cadastroElement) {
    loginElement.classList.remove("mostrar")
    loginElement.classList.add("hidden")
    cadastroElement.classList.remove("hidden")
    cadastroElement.classList.add("mostrar")
}
 export function mudarParaLogin (loginElement, cadastroElement) {
    cadastroElement.classList.remove("mostrar")
    cadastroElement.classList.add("hidden")
    loginElement.classList.remove("hidden")
    loginElement.classList.add("mostrar")
}

//funçao para alterar input de senha
export function alternarSenha(input) {
    // Pega a posição atual do cursor
    const start = input.selectionStart
    const end = input.selectionEnd

    // Verifica se está visível
    const visivel = input.getAttribute("data-visivel") === "true"

    // Alterna o tipo
    input.type = visivel ? "password" : "text"
    input.setAttribute("data-visivel", !visivel)

    // Restaura a posição do cursor
    requestAnimationFrame(() => {
        input.setSelectionRange(start, end)
    })
}



// exemplo de como adicionar

// adicionar isso antes do final do body <div id="toast-notification" class="toast"></div>
// da um import da function no arquivo js que vc va usar: import { showToast } from "../tela/ui_Funcoes.js" 
// chama o script com o type module: <script src="../js/logica/tela_perfil.js" type="module"></script> 
// puxa o css de menu <link rel="stylesheet" href="../css/menusAdicionados.css">
// e bota um comando tipo esse com a mensagem que tu quer: showToast('Cadastro realizado com sucesso!', 'success');

export function showToast(message, type = 'success', duration = 4000) {
    // Variável para controlar o timer e evitar sobreposição
    let toastTimer
    const toast = document.getElementById('toast-notification');
    if (!toast) return; // Se o elemento não existir na página, não faz nada

    // Limpa qualquer timer anterior para reiniciar a contagem
    clearTimeout(toastTimer);

    // Define a mensagem e o tipo (cor)
    toast.textContent = message;
    toast.className = 'toast show'; // Reseta as classes e adiciona 'show'
    if (type === 'success') {
        toast.classList.add('success');
    } else if (type === 'error') {
        toast.classList.add('error');
    }

    // Define um timer para esconder o toast depois da duração especificada
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}