import { showToast } from '../tela/ui_Funcoes.js'

// --- Variáveis Globais ---
// Apenas declaramos as variáveis aqui. Não atribuímos valor.
let allProjects = []
let slidesContainer
let selectAno
let carouselContainer
let carouselIndex = 0

// --- Funções Principais (Definições) ---
// (Estas funções são apenas definidas, não executadas ainda)

function populateCarousel(projectsToShow) {
    if (!slidesContainer) return // Verificação de segurança
    slidesContainer.innerHTML = '' // Limpa o carrossel

    if (projectsToShow.length === 0) {
        slidesContainer.innerHTML = '<p style="padding: 20px; color: #353535; font-size: 18px;">Nenhum projeto encontrado para este ano.</p>';
    } else {
        projectsToShow.forEach(jogo => {
            const a = document.createElement("a")
            a.href = `paginas/jogo.html?id=${jogo.id}`
            a.innerHTML = `
                <div style="background-color: black;" class="jogo">
                    <img src="${jogo.imagem}" class="capa_jogo" alt="Capa do jogo ${jogo.nome}">
                    <p>${jogo.nome}</p>
                </div>
            `;
            slidesContainer.appendChild(a);
        });
    }
    resetCarousel(); // Reseta a posição visual do carrossel
}

/**
 * Popula o <select> com os anos únicos baseados nos projetos.
 * @param {Array} projects - Array de todos os projetos.
 */
function populateSelect(projects) {
    if (!selectAno) return; // Verificação de segurança
    
    const years = [...new Set(projects.map(p => p.ano))]
                   .filter(year => year != null)
                   .sort((a, b) => b - a);

    if (years.length === 0) {
        selectAno.style.display = 'none'; // Esconde se não houver anos
        return;
    }

    selectAno.innerHTML = '';
    const currentYear = new Date().getFullYear();

    const allOption = document.createElement('option');
    allOption.value = 'todos';
    allOption.textContent = 'Todos os Anos';
    selectAno.appendChild(allOption);

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        selectAno.appendChild(option);
    });

    if (selectAno.value !== String(currentYear)) {
        allOption.selected = true;
    }
}

/**
 * Filtra a lista 'allProjects' com base no ano selecionado e chama populateCarousel.
 */
function filterAndDisplayProjects() {
    if (!selectAno || !allProjects) return; // Verificação de segurança
    const selectedYear = selectAno.value;

    if (selectedYear === 'todos') {
        populateCarousel(allProjects); // Mostra todos
    } else {
        const filteredProjects = allProjects.filter(p => p.ano == selectedYear);
        populateCarousel(filteredProjects);
    }
}

/**
 * Busca os dados da API e inicializa a página.
 */
async function initializeIndexPage() {
    // Garante que os elementos existam antes de tentar usá-los
    if (!slidesContainer || !selectAno) {
        console.error("Erro fatal: slidesContainer ou selectAno não foram encontrados no DOM.");
        return;
    }

    try {
        const res = await fetch("/api/projetos"); // Usa a rota da API
        if (!res.ok) {
            throw new Error(`Erro ao buscar projetos: ${res.statusText}`);
        }
        allProjects = await res.json(); // Armazena na variável global

        if (!allProjects || allProjects.length === 0) {
             slidesContainer.innerHTML = '<p style="padding: 20px; color: #353535; font-size: 18px;">Nenhum projeto publicado ainda.</p>';
             selectAno.style.display = 'none';
             return;
        }

        populateSelect(allProjects);
        selectAno.addEventListener('change', filterAndDisplayProjects);
        filterAndDisplayProjects(); // Exibe os projetos do ano padrão

    } catch (err) {
        console.error("Erro ao carregar jogos:", err);
        // O erro (linha 94) acontecia aqui. Agora 'slidesContainer' já foi verificado.
        slidesContainer.innerHTML = '<p style="padding: 20px; color: red;">Erro ao carregar projetos. Tente novamente mais tarde.</p>';
    }
}

// --- Lógica do Carrossel ---
function updateCarouselDisplay() {
    if (!carouselContainer || !slidesContainer) return;
    const itens = slidesContainer.querySelectorAll("a");
    if (itens.length === 0) {
        slidesContainer.style.transform = 'translateX(0px)';
        return;
    }
    
    // Calcula a largura do item SOMENTE se houver itens
    const itemWidth = (itens[0]?.offsetWidth || 250) + 20 // 250 é um fallback, 20 é o 'gap'
    
    if (carouselIndex >= itens.length) carouselIndex = 0
    if (carouselIndex < 0) carouselIndex = itens.length - 1

    slidesContainer.style.transform = `translateX(${-carouselIndex * itemWidth}px)`
}

function resetCarousel() {
    carouselIndex = 0;
    updateCarouselDisplay();
}

// --- PONTO DE ENTRADA PRINCIPAL ---
// Espera o HTML estar pronto antes de fazer qualquer coisa
document.addEventListener('DOMContentLoaded', () => {
    
    // *** CORREÇÃO PRINCIPAL: Atribui as variáveis DEPOIS que o DOM carregou ***
    slidesContainer = document.getElementById("slides-jogos");
    selectAno = document.getElementById("select_ano");
    carouselContainer = document.querySelector(".carrosel_jogos");
    // *** FIM DA CORREÇÃO ***

    // Verifica se os elementos essenciais foram encontrados
    if (!slidesContainer || !selectAno || !carouselContainer) {
        console.error("Erro: Não foi possível encontrar os elementos essenciais do carrossel/filtro no HTML.");
        return; // Impede a execução do resto do script se o HTML estiver quebrado
    }

    // Lógica do Toast (para mensagens de outras páginas)
    const toastDataString = localStorage.getItem('toastMessage')
    if (toastDataString) {
        try {
            const toastData = JSON.parse(toastDataString)
            showToast(toastData.message, toastData.type)
            localStorage.removeItem('toastMessage')
        } catch (e) {
            console.error("Erro ao processar toast message:", e)
            localStorage.removeItem('toastMessage')
        }
    }

    // Adiciona listeners do carrossel
    const prev = carouselContainer.querySelector(".prev");
    const next = carouselContainer.querySelector(".next");
    
    if (prev && next) { // Garante que os botões existam
        prev.addEventListener("click", () => {
            const itens = slidesContainer.querySelectorAll("a");
            if (itens.length === 0) return;
            carouselIndex = (carouselIndex - 1 + itens.length) % itens.length;
            updateCarouselDisplay();
        });
        next.addEventListener("click", () => {
            const itens = slidesContainer.querySelectorAll("a");
            if (itens.length === 0) return;
            carouselIndex = (carouselIndex + 1) % itens.length;
            updateCarouselDisplay();
        });
    }
    
    window.addEventListener('resize', updateCarouselDisplay);
    
    // Finalmente, inicia o carregamento dos projetos
    initializeIndexPage()
})