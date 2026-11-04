(() => {
const motion = matchMedia('(prefers-reduced-motion: reduce)');
if(!motion.matches && 'IntersectionObserver' in window && Element.prototype.animate){
  const animations=new Set();
  const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;
    observer.unobserve(target);
    const animation=target.animate([{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{
      duration:720,delay:Number(target.dataset.entryDelay||0),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'
    });
    animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));
  }),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  document.querySelectorAll('.hero-copy>*,.hero-art,.audience-heading,.audience-viewport,.section-heading,.hub-heading,.service-card,.hub-visual,.hub-item,.quote-card,.article-card,.faq-grid>div,.contact-copy,.contact-panel').forEach(el=>{
    if (!el.closest('.alteracoes-v6')) return;
    const group=el.parentElement;
    const siblings=[...group.children].filter(child=>child.matches('.service-card,.quote-card,.article-card,.hub-item'));
    el.dataset.entryDelay=String(Math.max(0,siblings.indexOf(el))*70);
    observer.observe(el);
  });
  document.addEventListener('focusin',()=>animations.forEach(animation=>{if(animation.effect.target.contains(document.activeElement))animation.finish()}));
  motion.addEventListener('change',e=>{if(e.matches){observer.disconnect();animations.forEach(animation=>animation.cancel());animations.clear()}});
}

})();
