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

document.querySelectorAll(".carrosel-galeria-videos").forEach(carrosel => {
  const slides = carrosel.querySelector(".slides");
  if (!slides) return;

  // Seleciona qualquer item filho direto da lista de slides (flexível)
  const itens = slides.children;
  if (!itens || itens.length === 0) return;

  const prev = carrosel.querySelector(".prev");
  const next = carrosel.querySelector(".next");

  let index = 0;
  let itemWidth = 0;
  const GAP = 20; // ajuste se o gap no CSS for diferente

  // calcula a largura de um item (usa getBoundingClientRect para maior precisão)
  function calcItemWidth() {
    if (itens.length === 0) return 0;
    // mede o primeiro item visível
    const rect = itens[0].getBoundingClientRect();
    itemWidth = Math.round(rect.width) + GAP;
  }

  function updateCarousel(animate = true) {
    // se não houver largura calculada, tenta calcular
    if (!itemWidth) calcItemWidth();
    if (!itemWidth) return;

    if (!animate) {
      slides.style.transition = "none";
    } else {
      slides.style.transition = ""; // usa o transition definido no CSS
    }

    slides.style.transform = `translateX(${-index * itemWidth}px)`;
    // força repaint para garantir que transition:none seja aplicado
    if (!animate) slides.getBoundingClientRect();
    if (!animate) slides.style.transition = "";
  }

  // prev / next seguros
  if (prev) {
    prev.addEventListener("click", () => {
      index--;
      if (index < 0) index = itens.length - 1;
      updateCarousel();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      index++;
      if (index >= itens.length) index = 0;
      updateCarousel();
    });
  }

  // recalcula quando a janela muda de tamanho
  window.addEventListener("resize", () => {
    calcItemWidth();
    // garante que o translate seja atualizado para o novo tamanho
    updateCarousel(false);
  });

  // caso os itens sejam <video>, algumas larguras só ficam corretas após loadmetadata
  // aguardamos todos os vídeos carregarem metadados (se houver vídeos) antes de calcular
  const videos = slides.querySelectorAll("video");
  if (videos.length > 0) {
    let loaded = 0;
    videos.forEach(v => {
      if (v.readyState >= 1) { // já carregou metadados
        loaded++;
      } else {
        v.addEventListener("loadedmetadata", () => {
          loaded++;
          if (loaded === videos.length) {
            calcItemWidth();
            updateCarousel(false);
          }
        }, { once: true });
      }
    });
    // se todos já estavam prontos
    if (loaded === videos.length) {
      calcItemWidth();
      updateCarousel(false);
    }
  } else {
    // itens não são vídeos: calcula imediatamente
    calcItemWidth();
    updateCarousel(false);
  }
});
