// Destaques automáticos independentes do carrossel de avaliações abaixo.
(() => {
  const carousel = document.querySelector('.featured-testimonials');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.featured-review')];
  const dots = [...carousel.querySelectorAll('[data-featured-index]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let hovering = false;
  let focused = false;
  let visible = false;
  let timer;

  function schedule() {
    clearTimeout(timer);
    if (paused || hovering || focused || !visible || document.hidden) return;
    timer = setTimeout(() => select(current + 1), 7000);
  }
  function select(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-current', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    schedule();
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
  carousel.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => {
    focused = carousel.contains(event.relatedTarget);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', event => {
    paused = event.matches;
    schedule();
  });
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    schedule();
  }, { threshold: .15 });
  observer.observe(carousel);
})();
