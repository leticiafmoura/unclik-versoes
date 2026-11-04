(() => {
 const track=document.querySelector('#audience-track');if(!track)return;
 const cards=[...track.querySelectorAll('.audience-card')],choices=[...document.querySelectorAll('[data-audience]')];
 const prev=document.querySelector('.audience-prev'),next=document.querySelector('.audience-next');
 const number=document.querySelector('#audience-current'),name=document.querySelector('#audience-selected-name');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,programmatic=false,programTimer,scrollTimer,drag=null,suppressClick=false;
 function update(i){current=Math.max(0,Math.min(cards.length-1,i));cards.forEach((c,n)=>c.classList.toggle('is-current',n===current));choices.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===current)));number.textContent=String(current+1).padStart(2,'0');name.textContent=' · '+cards[current].querySelector('h3').textContent.trim();prev.disabled=current===0;next.disabled=current===cards.length-1}
 function go(i){update(i);programmatic=true;clearTimeout(programTimer);const offset=cards[current].offsetLeft-track.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft);track.scrollTo({left:Math.max(0,Math.min(track.scrollWidth-track.clientWidth,offset)),behavior:reduce.matches?'instant':'smooth'});programTimer=setTimeout(()=>{programmatic=false},reduce.matches?50:650)}
 choices.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
 prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
 track.addEventListener('keydown',ev=>{let i=current;if(ev.key==='ArrowRight')i++;else if(ev.key==='ArrowLeft')i--;else if(ev.key==='Home')i=0;else if(ev.key==='End')i=cards.length-1;else return;ev.preventDefault();go(i);if(ev.target.closest('a'))cards[current].querySelector('a').focus({preventScroll:true})});
 track.addEventListener('focusin',ev=>{const card=ev.target.closest('.audience-card');if(card)go(cards.indexOf(card))});
 function updateFromScroll(){if(programmatic||drag)return;const max=track.scrollWidth-track.clientWidth;if(track.scrollLeft<10)return update(0);if(track.scrollLeft>max-10)return update(cards.length-1);const center=track.getBoundingClientRect().left+parseFloat(getComputedStyle(track).paddingLeft);let best=0,dist=Infinity;cards.forEach((c,i)=>{const r=c.getBoundingClientRect(),d=Math.abs(r.left-center);if(d<dist){dist=d;best=i}});update(best)}
 track.addEventListener('scroll',()=>{clearTimeout(scrollTimer);if(!programmatic)scrollTimer=setTimeout(updateFromScroll,110)},{passive:true});
 track.addEventListener('pointerdown',ev=>{programmatic=false;clearTimeout(programTimer);if(ev.pointerType!=='mouse'||ev.button!==0)return;drag={id:ev.pointerId,x:ev.clientX,scroll:track.scrollLeft,moved:false};programmatic=false;clearTimeout(programTimer)});
 track.addEventListener('pointermove',ev=>{if(!drag||drag.id!==ev.pointerId)return;if(!(ev.buttons&1)){finish(ev);return}const delta=ev.clientX-drag.x;if(Math.abs(delta)>7&&!drag.moved){drag.moved=true;track.classList.add('is-dragging');track.setPointerCapture(ev.pointerId)}if(drag.moved){ev.preventDefault();track.scrollLeft=drag.scroll-delta}});
 function finish(ev){if(!drag||drag.id!==ev.pointerId)return;const moved=drag.moved;drag=null;track.classList.remove('is-dragging');if(track.hasPointerCapture(ev.pointerId))track.releasePointerCapture(ev.pointerId);if(moved){suppressClick=true;setTimeout(()=>suppressClick=false,100);updateFromScroll()}}
 window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
 window.addEventListener('blur',()=>{if(drag)finish({pointerId:drag.id})});
 track.addEventListener('click',ev=>{if(suppressClick){ev.preventDefault();ev.stopImmediatePropagation()}},true);
 track.addEventListener('dragstart',ev=>ev.preventDefault());
 track.addEventListener('wheel',()=>{programmatic=false;clearTimeout(programTimer)},{passive:true});
 window.addEventListener('resize',()=>go(current));
 track.closest('.audiences').classList.add('is-enhanced');
 update(0);
})();
