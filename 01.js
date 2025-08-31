document.querySelectorAll(".carrosel_jogos").forEach(carrosel => {
  const slides = carrosel.querySelector(".slides");
  const itens = slides.querySelectorAll("a"); // pega os <a>, não só os divs
  const prev = carrosel.querySelector(".prev");
  const next = carrosel.querySelector(".next");

  let index = 0;

  function updateCarousel() {
    const itemWidth = itens[0].offsetWidth + 20; // largura + gap
    slides.style.transform = `translateX(${-index * itemWidth}px)`;
  }

  prev.addEventListener("click", () => {
    if (index > 0) index--;
    updateCarousel();
  });

  next.addEventListener("click", () => {
    if (index < itens.length - 1) index++;
    updateCarousel();
  });
});
