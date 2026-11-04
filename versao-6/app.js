const menu = document.querySelector('#mobile-menu');
const menuButton = document.querySelector('.menu-toggle');
const review = document.querySelector('#review-dialog');
let returnFocus = null;
let menuAnchor = null;
function showReview(title, content) {
  returnFocus = document.activeElement;
  document.querySelector('#review-title').textContent=title;
  document.querySelector('#review-body').replaceChildren();
  if (typeof content==='string') document.querySelector('#review-body').innerHTML=content;
  else document.querySelector('#review-body').append(content);
  review.showModal();
}
const notes = '<p>Esta alternativa mantém a copy V2 e antecipa os públicos para a segunda seção, em um carrossel com seleção direta, setas, arraste e teclado.</p><ul><li>As ilustrações do HUB explicam funções documentadas com a identidade da Unclik. São composições conceituais, não capturas da interface real.</li><li>A substituição definitiva dos prints ainda será discutida com a cliente. A proposta anterior continua disponível para comparação.</li><li>As ilustrações dos públicos representam atividades. Os depoimentos e retratos continuam com as mesmas fontes e pendências de autorização.</li><li>O formulário é demonstrativo: não envia nem salva dados. As páginas internas ainda não foram construídas.</li></ul><p>Versão visual V2 para revisão. Aprovação da cliente pendente.</p>';
document.querySelectorAll('[data-open-notes]').forEach(b=>b.addEventListener('click',()=>showReview('Uma direção para a nova home.',notes)));
menuButton.addEventListener('click',()=>{returnFocus=menuButton;menu.showModal()});
document.querySelector('.close-menu').addEventListener('click',()=>menu.close());
menu.addEventListener('close',()=>{
  if(menuAnchor){menuAnchor.focus({preventScroll:true});menuAnchor=null}
  else if(!review.open)menuButton.focus();
});
menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)menu.close()}});
menu.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
  menuAnchor=document.querySelector(a.getAttribute('href'));
  if(menuAnchor)menuAnchor.setAttribute('tabindex','-1');
  menu.close();
}));
document.querySelectorAll('.close-review').forEach(b=>b.addEventListener('click',()=>review.close()));
review.addEventListener('close',()=>returnFocus?.focus());
[menu,review].forEach(dialog=>dialog.addEventListener('keydown',ev=>{
  if(ev.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('a[href],button:not([disabled]),input,select,[tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=items[0],last=items[items.length-1];
  if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
  else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
}));
review.addEventListener('click',e=>{if(e.target===review){const r=review.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)review.close()}});
document.querySelectorAll('[data-planned]').forEach(a=>a.addEventListener('click',ev=>{
  ev.preventDefault();
  const fromMenu=menu.contains(a);
  if(menu.open)menu.close();
  const box=document.createElement('div');
  const p=document.createElement('p');p.textContent='Esta proposta visual cobre a home. O destino deste link será a página abaixo, com conteúdo próprio.';
  const path=document.createElement('p');path.className='planned-path';path.textContent=a.dataset.planned;path.style.cssText='font-weight:500;color:#8312bf;overflow-wrap:anywhere;margin-top:14px';
  box.append(p,path);showReview('Próxima página da jornada',box);if(fromMenu)returnFocus=menuButton;
}));
document.querySelector('[data-pending="google"]')?.addEventListener('click',()=>showReview('Avaliações com origem confirmada.','<p>A área está reservada para avaliações reais. O perfil oficial, os textos e as autorizações ainda precisam ser confirmados. Não foram adicionadas estrelas, notas ou avaliações fictícias.</p>'));
document.querySelectorAll('.faq-item button').forEach(b=>b.addEventListener('click',()=>{
  const open=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!open));document.getElementById(b.getAttribute('aria-controls')).hidden=open;
}));
const form=document.querySelector('#contact-form');
const formButton=document.querySelector('.form-submit');
formButton.disabled=false;
form.addEventListener('submit',ev=>ev.preventDefault());
formButton.addEventListener('click',()=>{
  if(!form.reportValidity())return;
  const s=document.querySelector('#form-status');s.hidden=false;s.textContent='Demonstração concluída. Nenhum dado foi enviado ou salvo. Na versão final, o registro no CRM será confirmado antes do acesso ao WhatsApp.';
});
document.addEventListener('click',ev=>{document.querySelectorAll('.nav-services[open]').forEach(d=>{if(!d.contains(ev.target))d.open=false})});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')document.querySelectorAll('.nav-services[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus()})});
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
    const group=el.parentElement;
    const siblings=[...group.children].filter(child=>child.matches('.service-card,.quote-card,.article-card,.hub-item'));
    el.dataset.entryDelay=String(Math.max(0,siblings.indexOf(el))*70);
    observer.observe(el);
  });
  document.addEventListener('focusin',()=>animations.forEach(animation=>{if(animation.effect.target.contains(document.activeElement))animation.finish()}));
  motion.addEventListener('change',e=>{if(e.matches){observer.disconnect();animations.forEach(animation=>animation.cancel());animations.clear()}});
}
