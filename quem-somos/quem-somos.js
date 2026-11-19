(() => {
  const gallery = document.querySelector('.about-gallery');
  if (!gallery) return;
  const track = gallery.querySelector('.about-gallery-track');
  const group = gallery.querySelector('.about-gallery-group');
  const toggle = gallery.querySelector('.about-gallery-toggle');
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.inert = true;
  track.append(duplicate);
  gallery.classList.add('is-looping');
  toggle.hidden = false;

  toggle.addEventListener('click', () => {
    const paused = gallery.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Retomar carrossel' : 'Pausar carrossel');
  });
})();

(() => {
  const timeline = document.querySelector('.about-timeline');
  if (!timeline) return;

  const stage = timeline.querySelector('.about-timeline-stage');
  const stories = [...timeline.querySelectorAll('.timeline-story')];
  const dial = timeline.querySelector('.timeline-dial');
  const svg = dial.ownerSVGElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const ticks = [];
  const labels = [];
  let centerX = 700;
  let centerY = 1980;
  let radius = 1900;
  let tickLength = 32;
  let tickAngle = .45;
  let stepAngle = 18;
  let totalAngle = stepAngle * (stories.length - 1);
  let activeStep = -1;
  let targetProgress = 0;
  let progress = 0;
  let frame = 0;
  let enabled = false;
  let lastTick = -1;

  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  function point(angle, radius) {
    const rad = angle * Math.PI / 180;
    return { x: centerX + Math.sin(rad) * radius, y: centerY - Math.cos(rad) * radius };
  }

  function tickAt(angle, major = false) {
    const line = document.createElementNS(ns, 'line');
    const outer = point(angle, radius);
    const inner = point(angle, radius - (major ? tickLength + 14 : tickLength));
    line.setAttribute('x1', outer.x);
    line.setAttribute('y1', outer.y);
    line.setAttribute('x2', inner.x);
    line.setAttribute('y2', inner.y);
    line.setAttribute('class', 'timeline-tick');
    dial.append(line);
    ticks.push({ element: line, angle });
  }

  function buildDial() {
    const width = timeline.clientWidth;
    const height = timeline.querySelector('.timeline-arc').clientHeight;
    centerX = width / 2;
    tickLength = width < 700 ? 26 : 32;
    const sag = Math.max(16, height - 36 - tickLength - 20);
    radius = Math.max(width * .95, ((width / 2) ** 2 + sag ** 2) / (2 * sag));
    centerY = radius + 36;
    stepAngle = Math.asin(width * .4 / radius) * 180 / Math.PI;
    totalAngle = stepAngle * (stories.length - 1);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    dial.replaceChildren();
    ticks.length = 0;
    labels.length = 0;
    tickAngle = 8 / radius * 180 / Math.PI;
    const edgeAngle = Math.asin(Math.min(.98, width * .55 / radius)) * 180 / Math.PI;
  for (let angle = -edgeAngle; angle <= totalAngle + edgeAngle; angle += tickAngle) {
    if (stories.some((_, i) => Math.abs(angle - i * stepAngle) < tickAngle * .6)) continue;
    tickAt(angle);
  }

  stories.forEach((story, index) => {
    const angle = index * stepAngle;
    tickAt(angle, true);
    const label = document.createElementNS(ns, 'text');
    const position = point(angle, radius + 22);
    label.setAttribute('x', position.x);
    label.setAttribute('y', position.y);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('transform', `rotate(${angle} ${position.x} ${position.y})`);
    label.setAttribute('class', 'timeline-year');
    label.textContent = story.dataset.year;
    dial.append(label);
    labels.push({ element: label, angle });
  });
  }

  function showStep(index) {
    if (index === activeStep) return;
    activeStep = index;
    stories.forEach((story, i) => {
      story.classList.toggle('is-active', i === index);
      story.setAttribute('aria-hidden', String(i !== index));
    });
  }

  function render() {
    const angle = progress * totalAngle;
    dial.setAttribute('transform', `rotate(${-angle} ${centerX} ${centerY})`);
    const tick = Math.floor(angle / tickAngle);
    if (tick !== lastTick) {
      ticks.forEach(item => item.element.classList.toggle('is-past', item.angle <= angle + .1));
      labels.forEach(item => item.element.classList.toggle('is-past', item.angle <= angle + .1));
      lastTick = tick;
    }
    showStep(Math.min(stories.length - 1, Math.round(progress * (stories.length - 1))));
  }

  function animate() {
    frame = 0;
    if (!enabled) return;
    const distance = timeline.offsetHeight - stage.offsetHeight;
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
    targetProgress = Math.max(0, Math.min(1, (headerHeight - timeline.getBoundingClientRect().top) / Math.max(1, distance)));
    progress += (targetProgress - progress) * .18;
    if (Math.abs(targetProgress - progress) < .0002) progress = targetProgress;
    render();
    if (progress !== targetProgress) frame = requestAnimationFrame(animate);
  }

  function schedule() {
    if (enabled && !frame) frame = requestAnimationFrame(animate);
  }

  function configure() {
    enabled = !reducedMotion.matches && window.innerHeight >= 540;
    timeline.classList.toggle('is-enhanced', enabled);
    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      stories.forEach(story => story.removeAttribute('aria-hidden'));
      return;
    }
    activeStep = -1;
    lastTick = -1;
    buildDial();
    showStep(Math.round(progress * (stories.length - 1)));
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', configure);
  window.addEventListener('pageshow', configure);
  reducedMotion.addEventListener('change', configure);
  configure();
})();

// Uma única foto se mantém contínua nos recortes do mosaico da sede.
(() => {
  const mosaic = document.querySelector('.about-office-mosaic');
  if (!mosaic) return;
  const mobile = matchMedia('(max-width: 1000px)');
  let frame = 0;
  function render() {
    frame = 0;
    const { width, height } = mosaic.getBoundingClientRect();
    if (!width || !height) return;
    const columns = mobile.matches ? 4 : 9;
    const rows = mobile.matches ? 3 : 4;
    const gap = 10;
    const cellWidth = (width - (columns - 1) * gap) / columns;
    const cellHeight = (height - (rows - 1) * gap) / rows;
    const scale = Math.max(width / 701, height / 285);
    const imageWidth = 701 * scale;
    const imageHeight = 285 * scale;
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const titleSpace = row === 0 && column < 2;
        const addressSpace = row >= 1 && column >= 6;
        if (!mobile.matches && (titleSpace || addressSpace)) continue;
        const tile = document.createElement('span');
        tile.className = 'about-office-tile';
        const left = column * (cellWidth + gap);
        const top = row * (cellHeight + gap);
        Object.assign(tile.style, {
          left: left + 'px', top: top + 'px',
          width: cellWidth + 'px', height: cellHeight + 'px',
          backgroundSize: imageWidth + 'px ' + imageHeight + 'px',
          backgroundPosition: ((width - imageWidth) * .5 - left) + 'px ' + ((height - imageHeight) * .58 - top) + 'px'
        });
        fragment.append(tile);
      }
    }
    mosaic.replaceChildren(fragment);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  new ResizeObserver(schedule).observe(mosaic);
  mobile.addEventListener('change', schedule);
  render();
})();
