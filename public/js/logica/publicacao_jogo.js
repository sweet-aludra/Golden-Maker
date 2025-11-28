import { showToast } from '../tela/ui_Funcoes.js'

// configuraçao do menu(nav)
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
}
// acessibilidade para mudança de cor
const btn = document.getElementById("toggle-theme");

// quando carrega a página
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
}

btn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll(".upload-area").forEach(area => {
        logicaDePreviewFotos(area)
    })

    // logica para mudar o span para falar o arquivo selecionado
    const inputArquivoJogo = document.getElementById('arquivo_jogo')
    const spanNomeArquivo = document.getElementById('nomeArquivo')

    if (inputArquivoJogo && spanNomeArquivo) {
        inputArquivoJogo.addEventListener('change', () => {
            if (inputArquivoJogo.files.length > 0) {
                spanNomeArquivo.textContent = inputArquivoJogo.files[0].name // Mostra o nome do arquivo selecionado
            } else {
                spanNomeArquivo.textContent = 'Nenhum arquivo selecionado'
            }
        })
    }

    // Envio do formulário via Fetch
    const formJogo = document.getElementById("form-projeto")
    if (formJogo) { // Verifica se o formulário existe na página
        formJogo.addEventListener("submit", async (e) => {
            e.preventDefault() // Impede o envio padrão
            const formData = new FormData(formJogo)
            const submitButton = formJogo.querySelector('input[type="submit"]')

            // --- Validação Simples no Frontend ---
            const nomeJogo = formData.get('nome')
            const descricaoJogo = formData.get('descricao')
            const imagemCapaFile = formData.get('imagem_capa') // Pega o ARQUIVO
            const nomeExecJogo = formData.get('nome_executavel')

            // verifica se os campos então vazios
            if (!nomeJogo || nomeJogo.trim() === '') {
                showToast('O nome do jogo é obrigatório.', 'error')
                return
            }
            if (!descricaoJogo || descricaoJogo.trim() === '') {
                showToast('A descrição do jogo é obrigatória.', 'error')
                return
            }
            if (!imagemCapaFile || imagemCapaFile.size === 0) {
                 showToast('A imagem de capa é obrigatória.', 'error')
                 return
            }
            if (!nomeExecJogo || nomeExecJogo.trim() === '') {
                showToast('O nome do arquivo exe é obrigatorio', 'error')
                return
            }
            // ------------------------------------

            if(submitButton){ // Verifica se o botão existe
                submitButton.disabled = true
                submitButton.value = "Publicando..."
            }

            try {
                const res = await fetch("/api/projetos", {
                    method: "POST",
                    body: formData
                    // credentials: 'include' // Descomenta se necessário
                })

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('toastMessage', JSON.stringify({
                        message: "Projeto publicado com sucesso!",
                        type: "success"
                    }))
                    document.querySelectorAll(".preview").forEach(p => {
                        p.style.display = "none"
                        p.src = ''
                    })
                    document.querySelectorAll(".upload-area span").forEach(s => s.style.display = 'inline')

                    if(spanNomeArquivo) { // Limpa o span do nome do arquivo
                        spanNomeArquivo.textContent = 'Nenhum arquivo selecionado'
                    }
                    formJogo.reset()
                    window.location.href = '/index.html'

                } else {
                    showToast(`Erro: ${data.erro || `Erro ${res.status} ao publicar.`}`, 'error')
                }
            } catch (err) {
                console.error("Erro no fetch ao publicar:", err)
                showToast("Erro de conexão. Verifique o console.", 'error')
            } finally {
                 if(submitButton){
                    submitButton.disabled = false
                    submitButton.value = "Publicar"
                 }
            }
        })

        // mudar numero de integrantes
        const selectDeIntegrantes = document.getElementById('numero_integrantes')
        const containerDinamico = document.getElementById('container_dinamico')

        selectDeIntegrantes.addEventListener('change', () => {

            const numeroDeIntegrantes = parseInt(selectDeIntegrantes.value, 10)

            // Limpa o container
            containerDinamico.innerHTML = ''

            for (let i = 1; i <= numeroDeIntegrantes; i++) {
                const htmlDoCampo = `
                    <div>
                        <h4>Foto</h4><br>
                            <div class="upload-area">
                                <input type="file" name="integrante_foto" class="fileUpload" accept="image/*" hidden>
                                <img class="preview" style="display:none; max-width:200px; margin-top:10px;">
                                <span>Clique para adicionar uma foto</span>
                            </div>
                            <p>Nome(completo):<br>
                                <input type="text" name="integrante_nome" class="txt_nome_integrante" placeholder="Nome e sobrenome">
                            </p>
                    </div>
                    `
                containerDinamico.insertAdjacentHTML('beforeend', htmlDoCampo)

                const novoItem = containerDinamico.lastElementChild

                const novaAreaDeUpload = novoItem.querySelector('.upload-area')

                logicaDePreviewFotos(novaAreaDeUpload)
            }
        })

        // mudar numero de fotos
        const selectDeFotos = document.getElementById('numero_fotos')
        const containerDinamico2 = document.getElementById('container_dinamico2')

        selectDeFotos.addEventListener('change', () => {

            const numeroDeFotos = parseInt(selectDeFotos.value, 10)

            // Limpa o container
            containerDinamico2.innerHTML = ''

            for (let f = 3; f <= numeroDeFotos; f++) {
                const htmlDoCampo2 = `
                            <div class="upload-area">
                                <input type="file" name="fotos_jogo" class="fileUpload" accept="image/*" hidden>
                                <img class="preview" style="display:none; max-width:200px; margin-top:10px;">
                                <span>Clique para adicionar uma foto</span> <!-- so adiconando pra ver como fica-->
                            </div><br>
                    `
                containerDinamico2.insertAdjacentHTML('beforeend', htmlDoCampo2)

                const novaAreaDeUpload = containerDinamico2.lastElementChild
                
                logicaDePreviewFotos(novaAreaDeUpload)
            }
        })
    }
})


function logicaDePreviewFotos (elemento) {
    const input = elemento.querySelector(".fileUpload")
    const preview = elemento.querySelector(".preview")
    const spanText = elemento.querySelector("span") // Pega o texto

    // Clique na área abre o seletor de arquivo
    elemento.addEventListener("click", () => {
        if (input) { // Verifica se o input existe antes de clicar
            input.click()
        }
    });

    // Preview da imagem escolhida
    if (input) { // Verifica se o input existe antes de adicionar listener
        input.addEventListener("change", () => {
            const file = input.files[0]
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader()
                reader.onload = e => {
                    if (preview) { // Verifica se o preview existe
                        preview.src = e.target.result
                        preview.style.display = "block"
                    }
                    if (spanText) spanText.style.display = "none" // Esconde o texto
                };
                reader.readAsDataURL(file)
            } else if (preview) {
                preview.style.display = 'none'
                preview.src = ''
                if (spanText) spanText.style.display = "inline" // Mostra o texto de volta
            }
        })
    }
}