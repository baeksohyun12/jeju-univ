const MAX_Z = 14;

document.addEventListener('DOMContentLoaded', initTerrarium);

document.addEventListener('dragstart', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
}, true);

function initTerrarium() {
  
  const plants = [];
  for (let i = 1; i <= MAX_Z; i++) {
    const el = document.getElementById('plant' + i);
    if (!el) continue;
   
    if (!el.style.zIndex) el.style.zIndex = String(i);

   
    const img = el.querySelector('.plant-img');
    if (img) img.setAttribute('draggable', 'false');

    makeDraggable(el, plants);
    plants.push(el);
  }

  
  function bringToFront(target) {
    const currentZ = parseInt(target.style.zIndex || '1', 10);
    plants.forEach((el) => {
      const z = parseInt(el.style.zIndex || '1', 10);
      if (z > currentZ) el.style.zIndex = String(z - 1);
    });
    target.style.zIndex = String(MAX_Z);
  }

 
  function makeDraggable(el, all) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    el.addEventListener('pointerdown', onDown);

    function onDown(e) {
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp, { once: true });
    }

    function onMove(e) {
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      el.style.top  = (el.offsetTop  - pos2) + 'px';
      el.style.left = (el.offsetLeft - pos1) + 'px';
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
    }

    el.addEventListener('dblclick', ()=>{
      bringToFront(el); 
    });
  }
}


console.log(document.getElementById('plant1'));

dragElement(document.getElementById('plant1'));
dragElement(document.getElementById('plant2'));
dragElement(document.getElementById('plant3'));
dragElement(document.getElementById('plant4'));
dragElement(document.getElementById('plant5'));
dragElement(document.getElementById('plant6'));
dragElement(document.getElementById('plant7'));
dragElement(document.getElementById('plant8'));
dragElement(document.getElementById('plant9'));
dragElement(document.getElementById('plant10'));
dragElement(document.getElementById('plant11'));
dragElement(document.getElementById('plant12'));
dragElement(document.getElementById('plant13'));
dragElement(document.getElementById('plant14'));