(() => {
 const track=document.querySelector('.reviews-track');if(!track)return;
 const cards=[...track.children],prev=document.querySelector('.reviews-prev'),next=document.querySelector('.reviews-next'),status=document.querySelector('.reviews-status');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let frame;
 const step=()=>cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);
 function update(){const max=track.scrollWidth-track.clientWidth;const end=track.scrollLeft>=max-3;const i=Math.round(track.scrollLeft/step());prev.disabled=track.scrollLeft<=3;next.disabled=end;status.textContent=String(i+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0')}
 function go(direction){track.scrollBy({left:direction*step(),behavior:motion.matches?'instant':'smooth'})}
 prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
 track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
 track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(e.key==='ArrowRight'?1:-1)}else if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:motion.matches?'instant':'smooth'})}});
 new ResizeObserver(update).observe(track);update();
})();
