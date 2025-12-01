async function carregarDadosDoJogo() {
    // 1. Pegar o ID do jogo da URL
    const params = new URLSearchParams(window.location.search)
    const jogoId = params.get('id');

    if (!jogoId) {
        document.getElementById('secao_jogue').innerHTML = '<h3 style="color: red; text-align: center;">Erro: ID do jogo não fornecido.</h3>';
        return
    }

    try {
        // 2. Buscar os dados do jogo na API
        const response = await fetch(`/api/projetos/${jogoId}`)
        if (!response.ok) {
            throw new Error(`Jogo não encontrado (Status: ${response.status})`);
        }
        
        const jogo = await response.json()
        
        // 3. Parsear os dados que vêm como JSON string do backend
        const fotosArray = jogo.fotos || []
        const integrantesArray = jogo.integrantes || []

        // 4. Selecionar os elementos do HTML pelos IDs
        const capaImg = document.getElementById('jogo_capa')
        const nomeEl = document.getElementById('jogo_nome')
        const descricaoEl = document.getElementById('jogo_descricao')
        const downloadContainer = document.getElementById('download_container')
        const faixaCarrossel = document.querySelector("#galeria_jogo .faixa_slides")
        const grupoContainer = document.getElementById('grupo_integrantes_container')
        const criadorEl = document.getElementById('jogo_criador_nick') // Elemento novo (opcional)

        // 5. Preencher os elementos com os dados
        if (capaImg) {
            capaImg.src = jogo.imagem // 'imagem' é a capa
            capaImg.alt = `Capa do jogo ${jogo.nome}`
        }
        if (nomeEl) nomeEl.textContent = jogo.nome
        if (descricaoEl) descricaoEl.textContent = jogo.descricao
        if (criadorEl && jogo.criador_nick) {
             criadorEl.textContent = `Criado por: @${jogo.criador_nick}`
        }

        // 6. Preenche o botão de Download
        const executavel = jogo.exe
        const nomeDoJogo = jogo.nome_jogo

        const ip = 'localhost'
        const url = `http://${ip}:3000`
        const arquivojogo = nomeDoJogo?.replace(/\\/g, '/')
        const urlDownload = `${url}/${arquivojogo}`

        const hrefBtnJogar = `goldenmaker://iniciar-jogo?nome=${jogo.nome}&url=${encodeURIComponent(urlDownload)}&executavel=${executavel}`

if (downloadContainer && nomeDoJogo && jogo.nome && executavel) { 
            // Limpa o container
            downloadContainer.innerHTML = ''

            //  cria o botão
            const btnLink = document.createElement('a')
            btnLink.href = hrefBtnJogar
            btnLink.className = 'btn-download'
            btnLink.textContent = `Jogar ${executavel}`
            
            // Aplica os seus estilos de alinhamento direto no elemento
            btnLink.style.display = 'flex'
            btnLink.style.justifyContent = 'center'
            btnLink.style.alignItems = 'center'
            btnLink.style.width = '100%'
            btnLink.style.height = '100%'
            btnLink.style.textDecoration = 'none'

            // cria a mensagem de aviso 
            const msgAviso = document.createElement('p');
            msgAviso.innerHTML = "Jogos pesados podem levar alguns segundos para abrir."
            msgAviso.style.display = 'none'
            msgAviso.style.marginTop = '10px'
            msgAviso.style.fontSize = '0.9rem'
            msgAviso.style.textAlign = 'center'

            // logica de clique
            btnLink.addEventListener('click', () => {
                btnLink.textContent = "Abrindo..."
                btnLink.style.opacity = "0.7"
                btnLink.style.cursor = "wait"
                
                // Mostra o aviso
                msgAviso.style.display = 'block'

                // Reseta o botão depois de 15 segundos caso o usuário queira tentar de novo
                setTimeout(() => {
                    btnLink.textContent = `Jogar ${executavel}`
                    btnLink.style.opacity = "1";
                    btnLink.style.cursor = "pointer";
                    msgAviso.textContent = "Se o jogo não abriu, verifique se o Launcher está aberto."
                    msgAviso.style.color = 'var(--withe)';
                }, 15000);
            })

            // Adiciona os elementos na tela
            downloadContainer.appendChild(btnLink)
            downloadContainer.appendChild(msgAviso)

        } else {
            downloadContainer.innerHTML = `<p>Este projeto não possui arquivos para jogar.</p>`;
        }


        // 7. Preencher a Galeria de Fotos
        if (faixaCarrossel) {
            faixaCarrossel.innerHTML = '' // Limpa os placeholders
            if (fotosArray.length > 0) {
                fotosArray.forEach(fotoUrl => {
                    const div = document.createElement('div')
                    div.className = 'img_jogo'
                    // Define a imagem como background para se ajustar ao CSS

                    const safeUrl = encodeURI(fotoUrl);
                    div.style.backgroundImage = `url(${safeUrl})`
                    div.style.backgroundSize = 'cover'
                    div.style.backgroundPosition = 'center'
                    faixaCarrossel.appendChild(div)
                })
            } else {
                faixaCarrossel.innerHTML = '<p style="padding: 0 20px; color: #555;">Este projeto não possui fotos adicionais.</p>';
            }
            // Reinicializa o carrossel da galeria
            inicializarCarrosselGaleria()
        }

        // 8. Preencher os Integrantes
        if (grupoContainer) {
            grupoContainer.innerHTML = '' // Limpa os placeholders
            if (integrantesArray.length > 0) {
                integrantesArray.forEach(integrante => {
                    const div = document.createElement('div')
                    div.className = 'integrante'
                    div.innerHTML = `
                        <img src="${integrante.foto || '../imgs/download.jpeg'}" alt="Foto de ${integrante.nome || 'integrante'}"><br>
                        <p>${integrante.nome || 'Nome não informado'}</p>
                    `;
                    grupoContainer.appendChild(div);
                });
            } else {
                grupoContainer.innerHTML = '<p style="padding: 20px; color: #555;">Nenhuma informação de integrante disponível.</p>';
            }
        }

    } catch (err) {
        console.error("Erro ao carregar dados do jogo:", err);
        document.getElementById('secao_jogue').innerHTML = `<h3 style="color: red; text-align: center;">Erro ao carregar projeto: ${err.message}</h3>`;
    }
}

// Inicializa a lógica do carrossel para a galeria de fotos.

function inicializarCarrosselGaleria() {
    const galeria = document.getElementById("galeria_jogo")
    if (!galeria) return

    const faixa = galeria.querySelector(".faixa_slides")
    const itens = faixa.querySelectorAll(".img_jogo")
    const prev = galeria.querySelector(".prev")
    const next = galeria.querySelector(".next")

    if (itens.length === 0) { // Se não há fotos, esconde botões
        prev.style.display = 'none'
        next.style.display = 'none'
        return
    }

    let index = 0

    function atualizarGaleria() {
        const itemWidth = itens[0].offsetWidth + 20; // largura + gap
        // Previne erro se itemWidth for 0
        if (itemWidth <= 20) return;
        faixa.style.transform = `translateX(${-index * itemWidth}px)`
    }

    prev.addEventListener("click", () => {
        index--;
        if (index < 0) {
            index = itens.length - 1;
        }
        atualizarGaleria();
    });

    next.addEventListener("click", () => {
        index++;
        if (index >= itens.length) {
            index = 0
        }
        atualizarGaleria()
    })

    // Chama uma vez para definir a posição inicial (após um pequeno delay)
    setTimeout(atualizarGaleria, 100)
    // Atualiza em caso de redimensionamento da janela
    window.addEventListener('resize', atualizarGaleria)
}

// Inicia o processo quando o HTML estiver pronto
document.addEventListener('DOMContentLoaded', carregarDadosDoJogo)