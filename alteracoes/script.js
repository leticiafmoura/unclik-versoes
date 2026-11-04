const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

// Mantém o header no fluxo e suaviza sua aparência durante a rolagem.
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  let headerFramePending = false;
  const updateHeader = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
    headerFramePending = false;
  };
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
  };
  window.addEventListener('scroll', () => {
    if (headerFramePending) return;
    headerFramePending = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeaderHeight).observe(siteHeader);
  } else {
    window.addEventListener('resize', updateHeaderHeight);
  }
  updateHeaderHeight();
  updateHeader();
}

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
  mainNav?.classList.toggle('is-open', !expanded);
  if (expanded) mainNav?.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => { dropdown.open = false; });
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
    mainNav.classList.remove('is-open');
    mainNav.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => { dropdown.open = false; });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  mainNav?.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => { dropdown.open = false; });
  if (menuButton?.getAttribute('aria-expanded') === 'true') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    mainNav?.classList.remove('is-open');
    menuButton.focus();
  }
});

const slides = [...document.querySelectorAll('.quote-slide')];
const slideCount = document.querySelector('.slide-count');
let activeSlide = 0;

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
  if (slideCount) {
    slideCount.innerHTML = `<b>${String(activeSlide + 1).padStart(2, '0')}</b> / ${String(slides.length).padStart(2, '0')}`;
  }
}

document.querySelector('.prev')?.addEventListener('click', () => showSlide(activeSlide - 1));
document.querySelector('.next')?.addEventListener('click', () => showSlide(activeSlide + 1));

// A mesma faixa pode ser navegada por botões, teclado ou gesto de rolagem.
const profileTrack = document.querySelector('#profile-track');
if (profileTrack) {
  const carousel = profileTrack.closest('.profile-carousel');
  const cards = [...profileTrack.querySelectorAll('.profile-card')];
  const previous = carousel.querySelector('.profile-prev');
  const next = carousel.querySelector('.profile-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollTimer;

  function updateProfiles() {
    const maxScroll = profileTrack.scrollWidth - profileTrack.clientWidth;
    previous.disabled = profileTrack.scrollLeft <= 2;
    next.disabled = profileTrack.scrollLeft >= maxScroll - 2;
  }

  function moveProfiles(direction) {
    if (cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const index = Math.round(profileTrack.scrollLeft / step);
    const maxScroll = profileTrack.scrollWidth - profileTrack.clientWidth;
    const left = Math.max(0, Math.min(maxScroll, (index + direction) * step));
    profileTrack.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  previous.addEventListener('click', () => moveProfiles(-1));
  next.addEventListener('click', () => moveProfiles(1));
  profileTrack.addEventListener('keydown', (event) => {
    if (event.target !== profileTrack) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveProfiles(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      profileTrack.scrollTo({
        left: event.key === 'Home' ? 0 : profileTrack.scrollWidth - profileTrack.clientWidth,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }
  });
  profileTrack.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateProfiles, 120);
  }, { passive: true });
  new ResizeObserver(updateProfiles).observe(profileTrack);
  carousel.querySelector('.profile-controls').hidden = false;
  updateProfiles();
}

// Entradas progressivas ao aparecer na tela. O conteúdo permanece visível
// sem JavaScript, sem suporte à API ou quando o usuário reduz movimentos.
(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionPreference.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const groups = [
    ['.hero-copy > *', 65],
    ['.hero-visual', 0],
    ['.revision-section-heading > *', 65],
    ['.entry-grid > *', 85],
    ['.hub-feature-intro > *', 65],
    ['.hub-real-stage', 0],
    ['.hub-feature-list > *', 65],
    ['.real-review-grid > *', 65],
    ['.digital-article-grid > *', 65],
    ['.metrics-inner > *', 65],
    ['.intro-heading > *', 65],
    ['.value-grid > .value-card', 90],
    ['.team-story-copy > *', 60],
    ['.team-story-gallery', 0],
    ['.services-heading > *', 80],
    ['.services-bento > .service-bento-card', 85],
    ['.services-foot', 0],
    ['.audience-heading > *', 80],
    ['.profile-carousel', 0],
    ['.hub-intro > *', 80],
    ['.hub-platform-preview', 0],
    ['.approach-heading', 0],
    ['.steps-grid > .step', 90],
    ['.human-support > *', 80],
    ['.testimonial-grid > *', 80],
    ['.partners-copy', 0],
    ['.partner-logos > *', 65],
    ['.footer-callout > *', 80],
    ['.footer-links-grid > *', 65]
  ];
  const delays = new WeakMap();
  const activeAnimations = new Map();
  let stopped = false;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      // O foco do teclado nunca deve aguardar uma animação.
      if (stopped || element.contains(document.activeElement)) continue;
      const fadeOnly = element.matches('.hero-visual, .profile-carousel');
      const distance = window.innerWidth <= 760 ? 16 : 24;
      const animation = element.animate([
        { opacity: 0, translate: fadeOnly ? '0 0' : `0 ${distance}px` },
        { opacity: 1, translate: '0 0' }
      ], {
        duration: fadeOnly ? 900 : 780,
        delay: delays.get(element) || 0,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });
      activeAnimations.set(element, animation);
      animation.onfinish = () => {
        activeAnimations.delete(element);
        animation.cancel();
      };
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  for (const [selector, interval] of groups) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.closest('.alteracoes-v6')) return;
      delays.set(element, Math.min(index * interval, 180));
      observer.observe(element);
    });
  }

  document.addEventListener('focusin', (event) => {
    for (const [element, animation] of activeAnimations) {
      if (!element.contains(event.target)) continue;
      animation.cancel();
      activeAnimations.delete(element);
    }
  });

  function stopMotion() {
    stopped = true;
    observer.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  }
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) stopMotion();
  });
  window.addEventListener('beforeprint', stopMotion);
})();
