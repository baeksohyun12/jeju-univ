const MAX_Z = 99;

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('terrarium');

  const plants = Array.from(document.querySelectorAll('[id^="plant"]'));
  plants.forEach((el, i) => {
    
    if (!el.style.zIndex) el.style.zIndex = String(i + 1);
    
    const img = el.querySelector('img');
    if (img) img.setAttribute('draggable', 'false');
    
    // draggable = true
    el.setAttribute('draggable', 'true');

    //드래그 시작
    el.addEventListener('dragstart', (e) => {
      const r = el.getBoundingClientRect();
      const payload = { id: el.id, dx: e.clientX - r.left, dy: e.clientY - r.top };
      
      currentDrag = payload;
      bringToFront(el);
    });

    el.addEventListener('dragend', () => { el.style.opacity = ''; currentDrag = null; });

    // 더블 클릭하면 맨 앞으로
    el.addEventListener('dblclick', () => bringToFront(el));
  });

  
  stage.addEventListener('dragover', (e) => {
    e.preventDefault();
    const data = getPayload(e) || currentDrag;
    const el = document.getElementById(data.id);
    if (el.parentElement !== stage) stage.appendChild(el);

    const { left, top } = computePos(e, stage, el, data.dx, data.dy);
    el.style.position = 'absolute';
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
  });

  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = getPayload(e);
    const el = document.getElementById(data.id);
    const { left, top } = computePos(e, stage, el, data.dx, data.dy);
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
    el.style.opacity = '';
    bringToFront(el);
  });

  function bringToFront(el) {
    const z = Math.max(...plants.map(p => parseInt(p.style.zIndex || '1', 10)), MAX_Z) + 1;
    el.style.zIndex = String(z);
  }

  function getPayload(e) {
    const raw = e.dataTransfer && e.dataTransfer.getData('text/plain');
  }

  function computePos(e, stage, el, dx, dy) {
    const r = stage.getBoundingClientRect();
    const cs = getComputedStyle(stage);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padT = parseFloat(cs.paddingTop)  || 0;
    const borderL = stage.clientLeft;
    const borderT = stage.clientTop;

    let left = e.clientX - (r.left + borderL) - padL - dx;
    let top  = e.clientY - (r.top  + borderT) - padT - dy;

    left = Math.max(0, Math.min(left, stage.clientWidth  - el.offsetWidth));
    top  = Math.max(0, Math.min(top,  stage.clientHeight - el.offsetHeight));
    return { left, top };
  }
});
