// Mantém os diálogos de demonstração dos links importados da V6.
(() => {
  const review = document.querySelector('#review-dialog');
  let returnFocus;
  document.querySelectorAll('.alteracoes-v6 [data-planned]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      returnFocus = link;
      document.querySelector('#review-title').textContent = 'Próxima página da jornada';
      const description = document.createElement('p');
      description.textContent = 'Esta proposta visual cobre a home. O destino deste link será a página abaixo, com conteúdo próprio.';
      const path = document.createElement('p');
      path.className = 'planned-path';
      path.textContent = link.dataset.planned;
      path.style.cssText = 'font-weight:500;color:#8312bf;overflow-wrap:anywhere;margin-top:14px';
      document.querySelector('#review-body').replaceChildren(description, path);
      review.showModal();
    });
  });
  review.querySelectorAll('.close-review').forEach(button => button.addEventListener('click', () => review.close()));
  review.addEventListener('close', () => returnFocus?.focus());
  review.addEventListener('click', event => {
    if (event.target !== review) return;
    const rect = review.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) review.close();
  });
})();

// Entrada única conforme cada parte do infográfico aparece na tela.
(() => {
  const map = document.querySelector('#mapa-nichos');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!map || motion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach(({ target }) => {
        observer.unobserve(target);
        const brand = target.classList.contains('niche-map-brand');
        const orbits = target.classList.contains('niche-map-orbits');
        const frames = brand
          ? [{ opacity: 0, scale: '.86' }, { opacity: 1, scale: '1' }]
          : orbits
            ? [{ opacity: 0, scale: '.97' }, { opacity: 1, scale: '1' }]
            : [{ opacity: 0, translate: '0 18px' }, { opacity: 1, translate: '0 0' }];
        const animation = target.animate(frames, {
          duration: orbits ? 1100 : 720,
          delay: orbits ? 0 : Math.min(stagger++ * 55, 330),
          easing: 'cubic-bezier(.22,1,.36,1)',
          fill: 'backwards'
        });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      });
  }, { threshold: .15, rootMargin: '0px 0px -24px 0px' });

  map.querySelectorAll('.niche-map-orbits, .niche-map-brand, .niche-map-labels li').forEach(element => observer.observe(element));
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.finish());
    animations.clear();
  });
})();
// Repete a lista visual para o movimento contínuo da faixa.
document.querySelectorAll('#parceiros .logo-carousel').forEach(carousel => {
  const track = carousel.querySelector('.logo-track');
  const duplicate = track.firstElementChild.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  track.append(duplicate);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => {
    carousel.classList.toggle('is-animated', !motion.matches);
    if (motion.matches) carousel.removeAttribute('tabindex');
    else carousel.tabIndex = 0;
  };
  motion.addEventListener('change', syncMotion);
  syncMotion();
});
