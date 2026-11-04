// Comportamentos locais da V3. Links e envio continuam desativados na revisão.
document.querySelectorAll('.v3-faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.v3-faq-item').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelector('#lead-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
});

// Depoimentos do Google e relatos anteriores compartilham a mesma faixa.
(() => {
  const track = document.querySelector('#review-track');
  if (!track) return;
  const section = track.closest('#depoimentos');
  const previous = section.querySelector('.v3-review-prev');
  const next = section.querySelector('.v3-review-next');
  const cards = [...track.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function update() {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }
  function move(direction) {
    if (cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const left = Math.max(0, Math.min(track.scrollWidth - track.clientWidth, (Math.round(track.scrollLeft / step) + direction) * step));
    track.scrollTo({left, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', update, {passive:true});
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth - track.clientWidth, behavior:reducedMotion.matches ? 'auto' : 'smooth'});
    }
  });
  document.querySelectorAll('.v3-review-avatar img').forEach(img => {
    const fallback = () => img.classList.add('is-unavailable');
    img.addEventListener('error', fallback);
    if (img.complete && !img.naturalWidth) fallback();
  });
  new ResizeObserver(update).observe(track);
  update();
})();

// A largura é reservada pelo CSS para trocar os nichos sem mover o H1.
(() => {
  const eyebrow = document.querySelector('.digital-eyebrow');
  const niches = [...document.querySelectorAll('.hero-niche')];
  if (!eyebrow || niches.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let visible = true;

  const updateRotation = () => {
    clearInterval(timer);
    if (document.hidden || reducedMotion.matches || !visible) return;
    timer = setInterval(() => {
      niches[current].classList.remove('is-active');
      current = (current + 1) % niches.length;
      niches[current].classList.add('is-active');
    }, 2000);
  };

  document.addEventListener('visibilitychange', updateRotation);
  reducedMotion.addEventListener('change', updateRotation);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateRotation();
    }).observe(eyebrow);
  }
  updateRotation();
})();
