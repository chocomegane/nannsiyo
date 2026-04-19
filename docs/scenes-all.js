/* ==============================================================
   All hi-fi scenes — registered onto window.SCENES
   ============================================================== */

// ==============================
// Helpers
// ==============================
function el(tag, cls, html){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html!=null) e.innerHTML = html;
  return e;
}

function petDisplay(species, stage, size=160) {
  // wraps the PixelPet canvas
  const wrap = el('div');
  wrap.style.position = 'relative';
  wrap.style.width = size + 'px';
  wrap.style.height = size + 'px';
  wrap.appendChild(PixelPet.createPetCanvas(species, stage, size));
  return wrap;
}

function showStatusBubble(parent, x, y) {
  const p = GAME.pet;
  const names = { dragon:'ドラゴン', unicorn:'ユニコーン', slime:'スライム', phoenix:'フェニックス', golem:'ゴーレム' };
  const stagenames = ['','ちび','通常','最終形態'];
  const b = el('div', 'status-pop');
  b.style.left = x+'px'; b.style.top = y+'px';
  b.innerHTML = `
    <div class="nm">${p.name} <span style="font-weight:400;color:var(--ink-2);font-size:11px">${names[p.species]} · ${stagenames[p.stage]}</span></div>
    <div>♥ 幸福</div><div class="bar"><span class="hap" style="width:${Math.round(p.hap*100)}%"></span></div>
    <div>🍚 空腹</div><div class="bar"><span class="hun" style="width:${Math.round(p.hun*100)}%"></span></div>
    <div>✦ Lv.${p.lv}</div><div class="bar"><span class="xp" style="width:${Math.round(p.xp*100)}%"></span></div>
  `;
  parent.appendChild(b);
  return b;
}

// ==============================
// 🏠 ROOM — Overhead doll-house
// ==============================
registerScene('room', (root) => {
  const time = GAME.time;
  const skyBase = { day:'#f4e9cf', dusk:'#f0c8a0', night:'#4a4870' }[time];
  const floorA = { day:'#d8c39c', dusk:'#c8a27a', night:'#6b6080' }[time];
  const floorB = { day:'#c8b38a', dusk:'#b8906a', night:'#5c5272' }[time];
  const wallColor = { day:'#ede6d4', dusk:'#dfbea0', night:'#595478' }[time];

  root.style.background = skyBase;

  // Thin always-on HUD for pet stats (Tweak C approach requested: stats pop on demand; here, an unobtrusive strip)
  const topbar = el('div');
  topbar.style.cssText = `position:absolute; top:0; left:0; right:0; height:36px; background:${wallColor}; border-bottom:2px solid var(--ink); display:flex; align-items:center; padding: 0 14px; gap:14px; font-size:12px; z-index:5;`;
  const stageNames = ['','ちび','通常','最終'];
  topbar.innerHTML = `
    <span style="font-weight:700">🐣 ${GAME.pet.name} <span style="color:var(--ink-2); font-weight:400">Lv.${GAME.pet.lv} · ${stageNames[GAME.pet.stage]}</span></span>
    <span style="color:var(--ink-2)">ドロップまで <b id="dropCd">42</b> s</span>
    <span style="margin-left:auto; color:var(--ink-2); font-size:11px">※ ペットをクリックで詳細</span>
  `;
  root.appendChild(topbar);

  // Iso room
  const room = el('div');
  room.style.cssText = 'position:absolute; inset: 36px 0 84px 0;';
  root.appendChild(room);

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 1080 500');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.style.cssText = 'width:100%; height:100%; display:block;';
  svg.innerHTML = `
    <!-- back wall -->
    <polygon points="540,40 920,200 920,120 540,-40" fill="${wallColor}" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 160,200 160,120 540,-40" fill="${wallColor}" stroke="#2a2420" stroke-width="2" filter="brightness(0.95)"/>
    <!-- floor diamond with tile pattern -->
    <defs>
      <pattern id="tile" width="80" height="40" patternUnits="userSpaceOnUse" patternTransform="skewX(-26.57)">
        <rect width="80" height="40" fill="${floorA}"/>
        <rect x="0" y="0" width="80" height="20" fill="${floorB}"/>
      </pattern>
    </defs>
    <polygon points="540,40 920,240 540,440 160,240" fill="${floorA}" stroke="#2a2420" stroke-width="2"/>
    <!-- tile lines -->
    ${(function(){
      let s = '';
      for (let i=1;i<6;i++) {
        const t = i/6;
        const x1 = 160 + (540-160)*t, y1 = 240 - (240-40)*t;
        const x2 = 540 + (920-540)*t, y2 = 40 + (240-40)*t;
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${floorB}" opacity="0.6"/>`;
      }
      for (let i=1;i<6;i++) {
        const t = i/6;
        const x1 = 540 + (920-540)*t, y1 = 40 + (240-40)*t;
        const x2 = 540 + (920-540)*t, y2 = 440 - (240-40)*(1-t) + (240-40)*(1-t);
        // simpler: just cross tile pattern
      }
      return s;
    })()}

    <!-- Wall furniture: bookshelf, clock, painting -->
    <!-- Back left wall: bookshelf -->
    <g transform="translate(240, 60)">
      <rect x="0" y="0" width="72" height="96" fill="#8a5a3a" stroke="#2a2420" stroke-width="2"/>
      <rect x="4" y="6" width="64" height="22" fill="#d4a24c"/>
      <rect x="4" y="32" width="64" height="22" fill="#c8553d"/>
      <rect x="4" y="58" width="64" height="22" fill="#6b8e7f"/>
      <line x1="10" y1="6" x2="10" y2="80" stroke="#2a2420"/>
      <line x1="18" y1="6" x2="18" y2="80" stroke="#2a2420"/>
      <line x1="26" y1="6" x2="26" y2="80" stroke="#2a2420"/>
      <line x1="34" y1="6" x2="34" y2="80" stroke="#2a2420"/>
      <line x1="42" y1="6" x2="42" y2="80" stroke="#2a2420"/>
      <line x1="50" y1="6" x2="50" y2="80" stroke="#2a2420"/>
      <line x1="58" y1="6" x2="58" y2="80" stroke="#2a2420"/>
    </g>
    <!-- Back center wall: clock -->
    <g transform="translate(500, 60)">
      <circle cx="30" cy="30" r="26" fill="#ede6d4" stroke="#2a2420" stroke-width="2"/>
      <circle cx="30" cy="30" r="3" fill="#2a2420"/>
      <line x1="30" y1="30" x2="30" y2="14" stroke="#2a2420" stroke-width="2"/>
      <line x1="30" y1="30" x2="42" y2="30" stroke="#2a2420" stroke-width="2"/>
      <text x="30" y="12" font-size="7" text-anchor="middle" font-family="Press Start 2P">XII</text>
    </g>
    <!-- Back right wall: aquarium -->
    <g transform="translate(720, 70)">
      <rect x="0" y="0" width="90" height="60" fill="#7fb3c8" stroke="#2a2420" stroke-width="2"/>
      <rect x="0" y="0" width="90" height="8" fill="#2a2420"/>
      <path d="M 10 40 Q 30 30 50 40 Q 70 50 85 40" fill="none" stroke="#fff" stroke-width="1"/>
      <g transform="translate(30, 30)">
        <path d="M 0 0 l -6 -4 l 0 8 Z" fill="#c8553d"/>
        <circle cx="2" cy="-1" r="1" fill="#fff"/>
      </g>
      <circle cx="20" cy="20" r="2" fill="#fff" opacity="0.8"/>
      <circle cx="70" cy="25" r="1.5" fill="#fff" opacity="0.8"/>
    </g>

    <!-- Floor furniture: carpet, plant, sofa (isometric-ish) -->
    <!-- Carpet (floor center) -->
    <polygon points="540,240 720,340 540,440 360,340" fill="#c8553d" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,270 680,340 540,410 400,340" fill="none" stroke="#f5e4b3" stroke-width="1.5" stroke-dasharray="4 3"/>
    <!-- Plant (floor left) -->
    <g transform="translate(300,260)">
      <ellipse cx="0" cy="32" rx="18" ry="6" fill="#2a2420" opacity="0.2"/>
      <path d="M -10 28 L -12 10 L 12 10 L 10 28 Z" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
      <path d="M -16 10 Q -10 -20 -2 -10 Q 4 -24 8 -8 Q 16 -18 14 0 Q 20 -2 14 10 Z" fill="#6b8e7f" stroke="#2a2420" stroke-width="1.5"/>
    </g>
    <!-- Sofa (floor right) -->
    <g transform="translate(740,310)">
      <polygon points="0,0 80,40 80,70 0,30" fill="#7a6cab" stroke="#2a2420" stroke-width="2"/>
      <polygon points="0,0 12,6 12,-18 0,-24" fill="#7a6cab" stroke="#2a2420" stroke-width="2" filter="brightness(1.2)"/>
      <polygon points="0,-24 12,-18 80,22 68,16" fill="#9b8cca" stroke="#2a2420" stroke-width="2"/>
      <polygon points="68,16 80,22 80,40 68,34" fill="#7a6cab" stroke="#2a2420" stroke-width="2" filter="brightness(0.85)"/>
      <polygon points="68,16 80,22 80,4 68,-2" fill="#9b8cca" stroke="#2a2420" stroke-width="2"/>
    </g>

    <!-- Dropped items on floor -->
    <g id="drops"></g>
  `;
  room.appendChild(svg);

  // Place pet on carpet center (pixel canvas overlay)
  const petWrap = document.createElement('div');
  petWrap.style.cssText = 'position:absolute; left:50%; top:58%; transform:translate(-50%,-50%); cursor:pointer; z-index:3;';
  const petScale = 5;
  const petCanvas = PixelPet.createPetCanvas(GAME.pet.species, GAME.pet.stage, 32*petScale);
  petWrap.appendChild(petCanvas);
  room.appendChild(petWrap);

  // Speech bubble / status on click
  let currentBubble = null;
  petWrap.addEventListener('click', () => {
    if (currentBubble) { currentBubble.remove(); currentBubble=null; return; }
    const rect = petWrap.getBoundingClientRect();
    const parentRect = room.getBoundingClientRect();
    currentBubble = showStatusBubble(room, (rect.left-parentRect.left)+rect.width, rect.top-parentRect.top-110);
    setTimeout(()=>{ if (currentBubble){ currentBubble.remove(); currentBubble=null;} }, 5000);
  });

  // Drops on floor (interactive)
  const drops = [
    { x: 40, y: 60, kind: 'coin', value: 50, emoji:'🪙' },
    { x: -80, y: 90, kind: 'rare', value: 300, emoji:'💎' },
    { x: 60, y: -20, kind: 'scale', value: 100, emoji:'🔸' },
  ];
  function renderDrops(){
    const host = room.querySelector('#drops') || svg.querySelector('#drops');
    // Use HTML overlay for clickable items
    const existing = room.querySelectorAll('.drop-item');
    existing.forEach(e=>e.remove());
    drops.forEach((d,i) => {
      const dEl = el('button', 'drop-item');
      dEl.style.cssText = `position:absolute; left:calc(50% + ${d.x}px); top:calc(58% + ${d.y}px); transform:translate(-50%,-50%); width:44px; height:44px; border-radius:50%; border:2px solid var(--ink); background:${d.kind==='rare'?'#f5e4b3':'#f0d290'}; box-shadow:3px 3px 0 var(--ink); cursor:pointer; font-size:20px; animation: float 1.8s ease-in-out infinite; z-index:2;`;
      dEl.textContent = d.emoji;
      dEl.title = `+${d.value}G で売却`;
      dEl.addEventListener('click', (e) => {
        e.stopPropagation();
        GAME.setCoin(GAME.coin + d.value);
        GAME.toast(`🪙 +${d.value}G を回収！`);
        drops.splice(i,1);
        renderDrops();
      });
      room.appendChild(dEl);
    });
  }
  renderDrops();

  // Auto drop timer
  let cd = 42;
  const cdEl = topbar.querySelector('#dropCd');
  const timer = setInterval(()=>{
    cd -= 1;
    if (cd <= 0) {
      const list = ['🔸','🪙','💎','✨','🟠'];
      drops.push({ x: (Math.random()*300-150)|0, y: (Math.random()*160-60)|0, kind:'coin', value: 50+Math.floor(Math.random()*200), emoji: list[Math.floor(Math.random()*list.length)] });
      renderDrops();
      cd = 30 + Math.floor(Math.random()*30);
      GAME.toast('✨ 新しいドロップ！');
    }
    if (cdEl && cdEl.isConnected) cdEl.textContent = cd;
    else clearInterval(timer);
  }, 1000);

  // Action dock (bottom)
  const dock = el('div');
  dock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:60px; background:var(--paper-2); border:2px solid var(--ink); border-radius:14px; box-shadow:4px 4px 0 var(--ink); display:flex; align-items:center; padding: 0 14px; gap:10px; z-index:5;`;
  dock.innerHTML = `
    <button class="btn primary" data-action="feed">🍎 エサをあげる</button>
    <button class="btn" data-action="pet">👋 なでる</button>
    <button class="btn sage" data-action="skill">✨ スキル発動</button>
    <button class="btn" data-action="collect">🧹 一括回収</button>
    <div style="flex:1"></div>
    <button class="btn mustard" data-action="sell">💰 まとめ売り</button>
    <button class="btn" data-action="detail">📜 ペット詳細</button>
  `;
  root.appendChild(dock);

  dock.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]'); if (!b) return;
    const a = b.dataset.action;
    if (a==='feed') { GAME.pet.hun = Math.min(1, GAME.pet.hun + 0.2); GAME.pet.hap = Math.min(1, GAME.pet.hap + 0.05); GAME.toast('🍎 おいしい！'); }
    if (a==='pet') { GAME.pet.hap = Math.min(1, GAME.pet.hap + 0.1); GAME.toast('💕 うれしい！'); playEmote('💕'); }
    if (a==='skill') { GAME.toast('🔥 火炎ブレス！'); playEmote('🔥'); }
    if (a==='collect') {
      const total = drops.reduce((s,d)=>s+d.value, 0);
      if (total>0) {
        GAME.setCoin(GAME.coin + total);
        GAME.toast(`🧹 +${total}G 全部回収！`);
        drops.length = 0;
        renderDrops();
      } else GAME.toast('回収できるものはありません');
    }
    if (a==='sell') GAME.toast('💰 在庫を売却しました');
    if (a==='detail') openPetDetail();
  });

  function playEmote(em){
    const emote = el('div');
    emote.textContent = em;
    emote.style.cssText = `position:absolute; left:50%; top:52%; transform:translateX(-50%); font-size:28px; z-index:6; animation: emote 1.2s forwards;`;
    room.appendChild(emote);
    setTimeout(()=>emote.remove(), 1300);
  }

  function openPetDetail() {
    const m = el('div');
    m.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.4); display:grid; place-items:center; z-index:100;';
    const stageNames = ['','ちび','通常','最終形態'];
    const speciesName = { dragon:'ドラゴン',unicorn:'ユニコーン',slime:'スライム',phoenix:'フェニックス',golem:'ゴーレム' }[GAME.pet.species];
    const m_inner = el('div', 'panel');
    m_inner.style.cssText = 'width: 580px; padding: 20px; background: var(--paper);';
    m_inner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h2 style="margin:0; font-size:18px;">📜 ${GAME.pet.name} の詳細</h2>
        <button class="btn" data-close>✕</button>
      </div>
      <div style="display:grid; grid-template-columns: 160px 1fr; gap: 16px;">
        <div id="petPreview"></div>
        <div>
          <div><b>種族:</b> ${speciesName}</div>
          <div><b>進化:</b> ${stageNames[GAME.pet.stage]} (Lv.${GAME.pet.lv})</div>
          <div style="margin-top:10px">♥ 幸福</div>
          <div class="bar"><span class="hap" style="width:${GAME.pet.hap*100}%"></span></div>
          <div>🍚 空腹</div>
          <div class="bar"><span class="hun" style="width:${GAME.pet.hun*100}%"></span></div>
          <div>✦ XP</div>
          <div class="bar"><span class="xp" style="width:${GAME.pet.xp*100}%"></span></div>
        </div>
      </div>
      <h3 style="margin:14px 0 6px">習得スキル</h3>
      <div style="display:flex; gap:8px;">
        ${[
          ['😀','顔文字','Lv2'],
          ['🔥','火炎ブレス','Lv3'],
          ['🍬','キャンディドロップ','Lv4'],
          ['🎊','クラッカー','Lv5'],
          ['🌀','ワープ','Lv6 🔒'],
          ['💚','ヒール','Lv8 🔒'],
          ['✨','プリズム','Lv10 🔒'],
        ].map(s=>`<div style="width:64px; text-align:center; border:2px solid var(--ink); padding:6px; border-radius:8px; background:${s[2].includes('🔒')?'#e8e1cf':'#f7f2e8'};"><div style="font-size:22px">${s[0]}</div><div style="font-size:10px">${s[1]}</div><div style="font-size:9px; color:var(--ink-2)">${s[2]}</div></div>`).join('')}
      </div>
    `;
    m.appendChild(m_inner);
    m_inner.querySelector('#petPreview').appendChild(PixelPet.createPetCanvas(GAME.pet.species, GAME.pet.stage, 160));
    m_inner.querySelector('[data-close]').addEventListener('click', ()=>m.remove());
    m.addEventListener('click', (e)=>{ if (e.target===m) m.remove(); });
    root.appendChild(m);
  }

  // Inject animations style
  if (!document.getElementById('roomAnims')) {
    const st = document.createElement('style');
    st.id = 'roomAnims';
    st.textContent = `
      @keyframes float { 0%,100% { transform:translate(-50%,-50%) translateY(0); } 50% { transform:translate(-50%,-50%) translateY(-5px); } }
      @keyframes emote { from { transform: translateX(-50%) translateY(0); opacity:0; } 30% { opacity:1;} to { transform: translateX(-50%) translateY(-50px); opacity:0; } }
    `;
    document.head.appendChild(st);
  }
});

// ==============================
// 🌳 PARK — Side-scrolling walk
// ==============================
registerScene('park', (root) => {
  const time = GAME.time;
  const sky = { day:'linear-gradient(180deg,#c8e4f0 0%,#e8f4da 70%)', dusk:'linear-gradient(180deg,#f0a878 0%,#f5d290 80%)', night:'linear-gradient(180deg,#2a3058 0%,#4a4870 80%)' }[time];
  root.style.background = sky;

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 1080 600');
  svg.setAttribute('preserveAspectRatio','xMidYMax slice');
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
  // background hills & trees
  const nightTint = time==='night'?' opacity="0.6"':'';
  svg.innerHTML = `
    <!-- distant hills -->
    <path d="M 0 340 Q 200 280 400 330 Q 600 280 800 320 Q 1000 290 1080 330 L 1080 600 L 0 600 Z" fill="#b5d5a0" stroke="#2a2420" stroke-width="2"${nightTint}/>
    <path d="M 0 400 Q 200 350 400 390 Q 600 340 800 380 Q 1000 350 1080 390 L 1080 600 L 0 600 Z" fill="#9bc585" stroke="#2a2420" stroke-width="2"${nightTint}/>
    <!-- path -->
    <path d="M -20 480 Q 540 440 1100 480" fill="none" stroke="#d4a24c" stroke-width="36" stroke-linecap="round"/>
    <path d="M -20 480 Q 540 440 1100 480" fill="none" stroke="#8a6a3a" stroke-width="36" stroke-linecap="round" stroke-dasharray="0 0" opacity="0.3"/>
    <!-- trees -->
    <g>
      <g transform="translate(120, 380)">
        <rect x="-6" y="0" width="12" height="26" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
        <circle cx="0" cy="-8" r="34" fill="#6b8e7f" stroke="#2a2420" stroke-width="2"/>
        <circle cx="-14" cy="-20" r="18" fill="#7da094" stroke="#2a2420" stroke-width="1.5"/>
        <circle cx="14" cy="-16" r="16" fill="#7da094" stroke="#2a2420" stroke-width="1.5"/>
      </g>
      <g transform="translate(880, 350)">
        <rect x="-8" y="0" width="16" height="40" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
        <circle cx="0" cy="-6" r="44" fill="#6b8e7f" stroke="#2a2420" stroke-width="2"/>
        <circle cx="-20" cy="-24" r="22" fill="#7da094" stroke="#2a2420" stroke-width="1.5"/>
      </g>
    </g>
    <!-- bench -->
    <g transform="translate(540, 420)">
      <rect x="-40" y="0" width="80" height="8" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
      <rect x="-40" y="8" width="6" height="18" fill="#8a5a3a" stroke="#2a2420"/>
      <rect x="34" y="8" width="6" height="18" fill="#8a5a3a" stroke="#2a2420"/>
      <rect x="-40" y="-14" width="80" height="6" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
    </g>
    <!-- lamppost (night) -->
    ${time==='night'?`
    <g transform="translate(320, 400)">
      <rect x="-3" y="0" width="6" height="-80" fill="#2a2420" transform="translate(0,80)"/>
      <circle cx="0" cy="-82" r="10" fill="#f5e4b3" stroke="#2a2420"/>
      <circle cx="0" cy="-82" r="30" fill="#f5e4b3" opacity="0.25"/>
    </g>`:''}
    <!-- clouds (day/dusk) -->
    ${time!=='night'?`
    <g opacity="0.9">
      <ellipse cx="200" cy="100" rx="38" ry="14" fill="#fff"/>
      <ellipse cx="230" cy="92" rx="28" ry="12" fill="#fff"/>
      <ellipse cx="800" cy="80" rx="44" ry="16" fill="#fff"/>
      <ellipse cx="830" cy="88" rx="30" ry="12" fill="#fff"/>
    </g>`:''}
    ${time==='night'?`
    <g>
      ${Array.from({length:30}).map(()=>{const x=Math.random()*1080,y=Math.random()*250; return `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`}).join('')}
      <circle cx="900" cy="120" r="28" fill="#f5e4b3" stroke="#2a2420"/>
      <circle cx="890" cy="112" r="22" fill="#2a3058"/>
    </g>`:''}
  `;
  root.appendChild(svg);

  // Player pets layer
  const petLayer = el('div');
  petLayer.style.cssText = 'position:absolute; inset:0; pointer-events:none;';
  root.appendChild(petLayer);

  // Other pets (AI)
  const others = [
    { species:'unicorn', stage:2, name:'もふ', x:200, y:430, dx:0.3, player:'プレイヤーA', chat:'こんにちは〜' },
    { species:'slime', stage:1, name:'ぴこ', x:420, y:445, dx:-0.2, player:'プレイヤーB', chat:'(*ﾟーﾟ)' },
    { species:'phoenix', stage:2, name:'フィフィ', x:720, y:420, dx:0.25, player:'プレイヤーC', chat:null },
    { species:'golem', stage:1, name:'ろく', x:860, y:440, dx:-0.15, player:'プレイヤーD', chat:'おっす' },
  ];
  // Your pet
  const you = { species:GAME.pet.species, stage:GAME.pet.stage, name:GAME.pet.name, x:540, y:430, dx:0, isYou:true };
  const allPets = [you, ...others];

  allPets.forEach((p) => {
    const d = el('div');
    const size = 96;
    d.style.cssText = `position:absolute; width:${size}px; height:${size}px; pointer-events:auto; cursor:pointer; transition: left 0.1s linear;`;
    d.dataset.kind = p.isYou ? 'you' : 'other';
    d.appendChild(PixelPet.createPetCanvas(p.species, p.stage, size));
    const label = el('div');
    label.style.cssText = `position:absolute; bottom:-4px; left:50%; transform:translateX(-50%); background:${p.isYou?'var(--accent)':'var(--paper)'}; color:${p.isYou?'#fff':'var(--ink)'}; border:1.5px solid var(--ink); border-radius:8px; padding: 1px 8px; font-size:11px; font-weight:700; white-space:nowrap;`;
    label.textContent = p.name + (p.isYou?' (you)':'');
    d.appendChild(label);
    p.el = d;
    petLayer.appendChild(d);

    if (p.chat) {
      const bub = el('div');
      bub.style.cssText = `position:absolute; bottom:${size+10}px; left:50%; transform:translateX(-50%); background:#fff; border:2px solid var(--ink); border-radius:10px; padding:5px 10px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap;`;
      bub.textContent = p.chat;
      d.appendChild(bub);
    }

    if (!p.isYou) {
      d.addEventListener('click', () => {
        // hover card (simplified)
        const card = el('div', 'panel');
        card.style.cssText = `position:absolute; left:${p.x + size}px; top:${p.y - 40}px; padding:10px; background:#fff; width:220px; z-index:10; font-size:12px;`;
        const speciesName = { dragon:'ドラゴン',unicorn:'ユニコーン',slime:'スライム',phoenix:'フェニックス',golem:'ゴーレム' }[p.species];
        card.innerHTML = `
          <div style="font-weight:700">${p.name} <span style="color:var(--ink-2); font-weight:400">(${p.player})</span></div>
          <div>${speciesName} · Lv.${10+Math.floor(Math.random()*30)}</div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="btn primary" style="padding:4px 10px; font-size:11px">👋 話しかける</button>
            <button class="btn" style="padding:4px 10px; font-size:11px">＋フレンド</button>
          </div>
          <button class="btn" style="padding:2px 8px; font-size:10px; position:absolute; top:4px; right:4px;" data-close>✕</button>
        `;
        card.querySelector('[data-close]').addEventListener('click', ()=>card.remove());
        root.appendChild(card);
        setTimeout(()=>card.remove(), 6000);
      });
    }
  });

  // Animate positions
  let t0 = performance.now();
  function tick(){
    const now = performance.now();
    allPets.forEach(p => {
      if (!p.isYou) {
        p.x += p.dx;
        if (p.x < 60 || p.x > 1000) p.dx *= -1;
      }
      if (p.el) {
        p.el.style.left = (p.x - 48) + 'px';
        p.el.style.top = (p.y - 50 - Math.sin(now/500 + p.x) * 2) + 'px';
      }
    });
    rafId = requestAnimationFrame(tick);
  }
  let rafId = requestAnimationFrame(tick);

  // You controls: arrow keys OR drag
  const keyHandler = (e) => {
    if (e.key==='ArrowLeft') { you.x -= 14; }
    if (e.key==='ArrowRight') { you.x += 14; }
    you.x = Math.max(60, Math.min(1000, you.x));
  };
  window.addEventListener('keydown', keyHandler);

  // Chat dock
  const chatDock = el('div');
  chatDock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:76px; background: var(--paper-2); border:2px solid var(--ink); border-radius:14px; box-shadow:4px 4px 0 var(--ink); padding: 10px 14px; z-index:10;`;
  chatDock.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; height:100%;">
      <span style="font-weight:700;">💬 チャット</span>
      <span style="color:var(--ink-2); font-size:11px">(← → で移動 / 60文字まで)</span>
      <input type="text" maxlength="60" placeholder="メッセージを入力…" style="flex:1; padding: 8px 12px; border:2px solid var(--ink); border-radius:8px; font-family:inherit; font-size:13px; background:#fff;" />
      <button class="btn primary">送信</button>
      <button class="btn">😀</button>
      <span style="color:var(--ink-2); font-size:11px">● 14人</span>
    </div>
  `;
  root.appendChild(chatDock);
  chatDock.querySelector('input').addEventListener('keydown', (e)=>{ e.stopPropagation(); });
  chatDock.querySelector('.btn.primary').addEventListener('click', () => {
    const t = chatDock.querySelector('input').value.trim();
    if (!t) return;
    const bub = el('div');
    bub.style.cssText = `position:absolute; bottom:106px; left:50%; transform:translateX(-50%); background:#fff; border:2px solid var(--ink); border-radius:10px; padding:5px 10px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap; z-index:20;`;
    bub.textContent = t;
    you.el.appendChild(bub);
    setTimeout(()=>bub.remove(), 4000);
    chatDock.querySelector('input').value = '';
  });

  // Cleanup
  root._cleanup = () => { cancelAnimationFrame(rafId); window.removeEventListener('keydown', keyHandler); };
});

// ==============================
// ⚔️ DUNGEON — JRPG style
// ==============================
registerScene('dungeon', (root) => {
  root.style.background = 'radial-gradient(circle at center, #3a3248 0%, #1d2026 100%)';

  // Floor/ceiling perspective
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 1080 600');
  svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
  svg.innerHTML = `
    <!-- stone wall -->
    <rect x="0" y="0" width="1080" height="340" fill="#2a2e36"/>
    <g stroke="#1d2026" stroke-width="2" fill="none">
      ${(function(){let s='';for (let y=40;y<340;y+=50) for (let x=(y/50%2?0:25);x<1080;x+=50) s+=`<rect x="${x}" y="${y}" width="50" height="50"/>`;return s;})()}
    </g>
    <!-- torches -->
    <g transform="translate(140, 60)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>
    <g transform="translate(940, 60)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>

    <!-- floor with perspective -->
    <polygon points="0,340 1080,340 1080,600 0,600" fill="#1d2026"/>
    <g stroke="#353a44" stroke-width="1.5">
      <line x1="540" y1="340" x2="0" y2="600"/>
      <line x1="540" y1="340" x2="1080" y2="600"/>
      <line x1="540" y1="340" x2="270" y2="600"/>
      <line x1="540" y1="340" x2="810" y2="600"/>
      <line x1="0" y1="400" x2="1080" y2="400"/>
      <line x1="0" y1="470" x2="1080" y2="470"/>
      <line x1="0" y1="540" x2="1080" y2="540"/>
    </g>
  `;
  root.appendChild(svg);

  // Top bar: floor + wave
  const topbar = el('div');
  topbar.style.cssText = `position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; z-index:5;`;
  topbar.innerHTML = `
    <div class="panel" style="padding:8px 14px; background:var(--paper); font-weight:700;">🗺️ フロア <span style="color:var(--accent)">F3</span> · Wave <b>2/3</b></div>
    <div class="panel" style="padding:8px 14px; background:var(--paper); font-size:12px;">累計勝利 <b>17</b> · 次のボスまで <b>3F</b></div>
    <button class="btn" data-act="retreat">🏃 撤退</button>
  `;
  root.appendChild(topbar);

  // Enemy
  const enemyName = 'オーク';
  const enemyHp = { cur: 82, max: 120 };
  const enemyBox = el('div');
  enemyBox.style.cssText = `position:absolute; right:180px; top:160px; z-index:3; text-align:center; width:240px;`;
  enemyBox.innerHTML = `
    <div style="font-size: 100px; margin-bottom:8px; text-shadow:0 0 20px rgba(0,0,0,0.5);">👹</div>
    <div style="color:#f5e4b3; font-weight:700; font-size:16px;">${enemyName} Lv.8</div>
    <div style="background:rgba(0,0,0,0.4); border:2px solid #f5e4b3; border-radius:8px; padding:4px; margin-top:6px; width:200px; margin-left:auto; margin-right:auto;">
      <div style="height:10px; background:#2a2420; border-radius:4px; overflow:hidden;">
        <div id="ehp" style="height:100%; background:#c8553d; width:${enemyHp.cur/enemyHp.max*100}%"></div>
      </div>
      <div style="color:#fff; font-size:10px; font-family: 'Press Start 2P';">${enemyHp.cur}/${enemyHp.max}</div>
    </div>
  `;
  root.appendChild(enemyBox);

  // Pet
  const petBox = el('div');
  petBox.style.cssText = `position:absolute; left:180px; top:280px; z-index:3; text-align:center; width:240px;`;
  const petCanvas = PixelPet.createPetCanvas(GAME.pet.species, GAME.pet.stage, 200);
  petBox.appendChild(petCanvas);
  const petLabel = el('div', null, `<div style="color:#f5e4b3; font-weight:700; font-size:16px;">${GAME.pet.name} (あなた)</div>`);
  petBox.appendChild(petLabel);
  root.appendChild(petBox);

  // Player HP (right side)
  const hpSide = el('div', 'panel');
  hpSide.style.cssText = `position:absolute; right:16px; bottom:140px; padding:12px; background:var(--paper); width:220px; z-index:4; font-size:13px;`;
  const php = { cur: 92, max: 100 };
  hpSide.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px;">あなたのペット</div>
    <div>HP <b id="phpTxt">${php.cur}/${php.max}</b></div>
    <div class="bar" style="height:10px;"><span id="phpBar" style="background:#6b8e7f; width:${php.cur/php.max*100}%"></span></div>
    <div style="margin-top:10px; color:var(--ink-2); font-size:11px;">次の敵攻撃まで</div>
    <div class="bar" style="height:6px;"><span id="atkBar" style="background:var(--accent-3); width:40%"></span></div>
  `;
  root.appendChild(hpSide);

  // Command menu
  const cmd = el('div', 'panel');
  cmd.style.cssText = `position:absolute; left:16px; right:250px; bottom:16px; padding:14px; background:var(--paper); display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; z-index:4;`;
  cmd.innerHTML = `
    <button class="btn primary" style="padding:16px; font-size:14px;" data-cmd="attack"><span style="font-size:22px">⚔️</span> 攻撃</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="skill"><span style="font-size:22px">✨</span> スキル</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="item"><span style="font-size:22px">🍎</span> アイテム</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="defend"><span style="font-size:22px">🛡️</span> 防御</button>
  `;
  root.appendChild(cmd);

  function showDmg(x, y, val, color='#c8553d') {
    const d = el('div');
    d.textContent = `-${val}`;
    d.style.cssText = `position:absolute; left:${x}px; top:${y}px; color:${color}; font-family:'Press Start 2P'; font-size:26px; text-shadow:2px 2px 0 #000; z-index:20; animation: dmg 1s forwards;`;
    root.appendChild(d);
    setTimeout(()=>d.remove(), 1000);
  }
  if (!document.getElementById('dungAnim')) {
    const st = document.createElement('style'); st.id='dungAnim';
    st.textContent = `@keyframes dmg { from { transform:translateY(0); opacity:0;} 20%{opacity:1;} to { transform:translateY(-40px); opacity:0;}} @keyframes shake { 0%,100% { transform: translateX(0);} 25%{transform:translateX(-6px);} 75%{transform:translateX(6px);} }`;
    document.head.appendChild(st);
  }

  cmd.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cmd]'); if (!b) return;
    const act = b.dataset.cmd;
    if (act === 'attack') {
      const dmg = 10 + Math.floor(Math.random()*20);
      enemyHp.cur = Math.max(0, enemyHp.cur - dmg);
      document.getElementById('ehp').style.width = (enemyHp.cur/enemyHp.max*100) + '%';
      enemyBox.querySelector('div:last-child div:last-child').textContent = `${enemyHp.cur}/${enemyHp.max}`;
      showDmg(780, 220, dmg);
      enemyBox.style.animation = 'shake 0.3s'; setTimeout(()=>enemyBox.style.animation='', 300);
      if (enemyHp.cur <= 0) { GAME.toast('🏆 勝利！ +150G +XP40'); GAME.setCoin(GAME.coin+150); }
    } else if (act === 'skill') {
      // Open skill picker
      const pick = el('div', 'panel');
      pick.style.cssText = `position:absolute; left:16px; bottom:170px; padding:10px; background:var(--paper); display:flex; gap:8px; z-index:5;`;
      [['🔥','火炎ブレス','35 dmg'],['🎊','クラッカー','20 dmg + stun'],['💕','なごませる','hap+10']].forEach((s,i)=>{
        const b = el('button','btn',`<div style="font-size:22px">${s[0]}</div><div style="font-size:11px">${s[1]}</div><div style="font-size:10px;color:var(--ink-2)">${s[2]}</div>`);
        b.style.cssText = 'padding:8px; display:flex; flex-direction:column;';
        b.addEventListener('click',()=>{
          pick.remove();
          enemyHp.cur = Math.max(0, enemyHp.cur - 35);
          document.getElementById('ehp').style.width = (enemyHp.cur/enemyHp.max*100) + '%';
          showDmg(800, 200, 35, '#d4a24c');
          GAME.toast(`✨ ${s[1]}！`);
        });
        pick.appendChild(b);
      });
      root.appendChild(pick);
      setTimeout(()=>pick.remove(), 5000);
    } else if (act === 'defend') {
      GAME.toast('🛡️ 防御の構え');
    } else if (act === 'item') {
      GAME.toast('🍎 回復薬を使った (+30HP)');
      php.cur = Math.min(php.max, php.cur + 30);
      document.getElementById('phpBar').style.width = (php.cur/php.max*100) + '%';
      document.getElementById('phpTxt').textContent = `${php.cur}/${php.max}`;
    }
  });

  topbar.querySelector('[data-act="retreat"]').addEventListener('click', ()=>{
    GAME.toast('🏃 自室に戻ります');
    setTimeout(()=>showScene('room'), 600);
  });

  // Enemy attack cooldown
  let cd = 0;
  const atk = setInterval(()=>{
    cd += 2;
    document.getElementById('atkBar').style.width = cd + '%';
    if (cd >= 100) {
      cd = 0;
      const dmg = 5 + Math.floor(Math.random()*6) + 6; // floor 3 * 2
      php.cur = Math.max(0, php.cur - dmg);
      document.getElementById('phpBar').style.width = (php.cur/php.max*100) + '%';
      document.getElementById('phpTxt').textContent = `${php.cur}/${php.max}`;
      showDmg(280, 320, dmg, '#fff');
      petBox.style.animation = 'shake 0.3s'; setTimeout(()=>petBox.style.animation='', 300);
    }
    if (!root.isConnected) clearInterval(atk);
  }, 100);
});

// ==============================
// 🎰 LOTTERY — 3 types as selectable products
// ==============================
registerScene('lottery', (root) => {
  root.style.background = 'linear-gradient(180deg, #f7e1c0 0%, #e8c89a 100%)';

  // Header
  const hdr = el('div');
  hdr.style.cssText = `position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center; z-index:4;`;
  hdr.innerHTML = `
    <div style="font-size:18px; font-weight:700;">🎰 宝くじ店「幸運堂」</div>
    <div style="font-size:12px; color:var(--ink-2);">今日の運勢: <b style="color:var(--accent)">★★★☆☆</b> / 本日の獲得: <b>+1,200 G</b></div>
  `;
  root.appendChild(hdr);

  // Three product cards
  const grid = el('div');
  grid.style.cssText = `position:absolute; top:64px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px;`;
  root.appendChild(grid);

  // ==== Product A: Garapon ====
  const pA = el('div', 'panel');
  pA.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;';
  pA.innerHTML = `
    <div style="width:100%; background:var(--accent); color:#fff; padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">🎲 ガラポン</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">伝統のガラガラ抽選<br/>1回 100G</div>
    <div style="position:relative; width:200px; height:200px; display:grid; place-items:center;">
      <div class="drum" style="width:170px; height:170px; background:#f5e4b3; border:4px solid var(--ink); border-radius:50%; display:grid; place-items:center; box-shadow:4px 4px 0 var(--ink); position:relative; transition:transform 1s cubic-bezier(.2,.7,.3,1);">
        <div style="font-size:54px;">🎲</div>
        <div style="position:absolute; left:-20px; top:50%; width:34px; height:8px; background:var(--ink); border-radius:4px;"></div>
        <div style="position:absolute; left:-28px; top:calc(50% - 6px); width:16px; height:16px; background:var(--ink); border-radius:50%;"></div>
      </div>
    </div>
    <button class="btn primary" data-act="garapon" style="width:100%; padding:10px;">🪙 100G で引く</button>
    <button class="btn" data-act="garapon10" style="width:100%;">10連 (1,000G)</button>
    <div style="margin-top:4px; font-size:11px; color:var(--ink-2); text-align:center;">🏆 1% · 🎊 9% · 🎉 30% · 😢 60%</div>
  `;
  grid.appendChild(pA);

  // ==== Product B: Scratch ====
  const pB = el('div', 'panel');
  pB.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;';
  pB.innerHTML = `
    <div style="width:100%; background:var(--accent-2); color:#fff; padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">✏️ スクラッチ</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">削ってそろえる<br/>1枚 100G</div>
    <div style="width:100%; background:#f5e4b3; border:2px solid var(--ink); border-radius:10px; padding:10px;">
      <div style="font-size:10px; text-align:center; color:var(--ink-2); font-family:'Press Start 2P'">TICKET #00342</div>
      <div class="scratch-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px; margin-top:6px;">
        ${Array.from({length:6}).map((_,i)=>`<div class="sc-cell" data-i="${i}" style="aspect-ratio:1; background:#9a8f85; border:2px solid var(--ink); border-radius:6px; display:grid; place-items:center; font-size:24px; cursor:pointer; color:#fff; font-weight:700; user-select:none;">?</div>`).join('')}
      </div>
    </div>
    <button class="btn primary" data-act="scratch" style="width:100%;">🪙 100G 新しい券</button>
    <div style="margin-top:4px; font-size:11px; color:var(--ink-2); text-align:center;">同じ絵柄3つで当たり</div>
  `;
  grid.appendChild(pB);

  // ==== Product C: Slot ====
  const pC = el('div', 'panel');
  pC.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;';
  pC.innerHTML = `
    <div style="width:100%; background:var(--accent-3); padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">🎰 スロット</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">3リール・派手演出<br/>1回 100G</div>
    <div style="display:flex; gap:6px; background:var(--ink); padding:8px; border-radius:10px; border:2px solid var(--ink);">
      ${[0,1,2].map(i=>`<div class="reel" data-r="${i}" style="width:60px; height:90px; background:#fff; border:2px solid var(--ink); border-radius:6px; display:grid; place-items:center; font-size:36px; overflow:hidden;">🐉</div>`).join('')}
    </div>
    <button class="btn primary" data-act="spin" style="width:100%; padding:12px; font-size:15px;">▶ SPIN (100G)</button>
    <div style="margin-top:4px; font-size:11px; color:var(--ink-2); text-align:center;">3つそろうと🏆 / 2つで🎉</div>
  `;
  grid.appendChild(pC);

  // Handlers
  function prize(r){ return r<0.01?{n:'🏆 大当たり',g:5000}:r<0.1?{n:'🎊 中当たり',g:1000}:r<0.4?{n:'🎉 小当たり',g:200}:{n:'😢 ハズレ',g:0}; }

  pA.querySelector('[data-act="garapon"]').addEventListener('click', ()=>{
    if (GAME.coin < 100) { GAME.toast('コイン不足'); return; }
    GAME.setCoin(GAME.coin - 100);
    const drum = pA.querySelector('.drum');
    drum.style.transform = `rotate(${720+Math.random()*360}deg)`;
    const p = prize(Math.random());
    setTimeout(()=>{ GAME.toast(`${p.n} ${p.g?'+'+p.g+'G':''}`); if (p.g) GAME.setCoin(GAME.coin + p.g); setTimeout(()=>drum.style.transform = 'rotate(0deg)', 1500); }, 1000);
  });
  pA.querySelector('[data-act="garapon10"]').addEventListener('click', ()=>{
    if (GAME.coin < 1000) { GAME.toast('コイン不足'); return; }
    GAME.setCoin(GAME.coin - 1000);
    let total = 0;
    for (let i=0;i<10;i++) { total += prize(Math.random()).g; }
    GAME.setCoin(GAME.coin + total);
    GAME.toast(`🎁 10連結果: +${total}G`);
  });

  // Scratch
  const symbols = ['💎','🪙','⭐','🔔','🍀','🐉'];
  let scratchReveal = Array.from({length:6}, ()=>symbols[Math.floor(Math.random()*symbols.length)]);
  pB.querySelector('[data-act="scratch"]').addEventListener('click', ()=>{
    if (GAME.coin < 100) { GAME.toast('コイン不足'); return; }
    GAME.setCoin(GAME.coin - 100);
    scratchReveal = Array.from({length:6}, ()=>symbols[Math.floor(Math.random()*symbols.length)]);
    pB.querySelectorAll('.sc-cell').forEach((c,i)=>{ c.style.background='#9a8f85'; c.textContent='?'; c.dataset.done=''; });
    GAME.toast('✏️ 新しい券 — こすって削ってね');
  });
  pB.querySelectorAll('.sc-cell').forEach((c) => {
    c.addEventListener('click', ()=>{
      if (c.dataset.done) return;
      c.dataset.done = 'y';
      const i = parseInt(c.dataset.i,10);
      c.style.background = 'var(--paper-2)';
      c.style.color = 'var(--ink)';
      c.textContent = scratchReveal[i];
      // check if all revealed
      const revealed = pB.querySelectorAll('.sc-cell[data-done]');
      if (revealed.length===6) {
        const counts = {};
        scratchReveal.forEach(s=>counts[s]=(counts[s]||0)+1);
        const maxMatch = Math.max(...Object.values(counts));
        if (maxMatch>=3) { GAME.toast('🎊 3つそろい！ +1,000G'); GAME.setCoin(GAME.coin + 1000); }
      }
    });
  });

  // Slot
  pC.querySelector('[data-act="spin"]').addEventListener('click', ()=>{
    if (GAME.coin < 100) { GAME.toast('コイン不足'); return; }
    GAME.setCoin(GAME.coin - 100);
    const reels = pC.querySelectorAll('.reel');
    const result = Array.from({length:3}, ()=>symbols[Math.floor(Math.random()*symbols.length)]);
    reels.forEach((r, i) => {
      r.style.transition = 'none';
      let steps = 20 + i*10;
      let n = 0;
      const tick = setInterval(()=>{
        r.textContent = symbols[Math.floor(Math.random()*symbols.length)];
        n++;
        if (n>=steps) { clearInterval(tick); r.textContent = result[i]; if (i===2) checkSlot(); }
      }, 60);
    });
  });
  function checkSlot(){
    const reels = pC.querySelectorAll('.reel');
    const a=reels[0].textContent, b=reels[1].textContent, c=reels[2].textContent;
    if (a===b && b===c) { GAME.toast('🏆 ALL MATCH! +5,000G'); GAME.setCoin(GAME.coin + 5000); }
    else if (a===b || b===c) { GAME.toast('🎉 2つそろい +200G'); GAME.setCoin(GAME.coin + 200); }
    else { GAME.toast('😢 ハズレ'); }
  }
});

// ==============================
// 🏆 RANKING — Podium
// ==============================
registerScene('ranking', (root) => {
  root.style.background = 'linear-gradient(180deg, #f7e8c0 0%, #efdba0 100%)';
  const hdr = el('div');
  hdr.style.cssText = 'position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center;';
  hdr.innerHTML = `
    <div>
      <div style="font-size:20px; font-weight:700;">🏆 所持金ランキング</div>
      <div style="font-size:11px; color:var(--ink-2);">更新: たった今 · 全 2,431 人</div>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn primary">全体</button>
      <button class="btn">フレンド</button>
      <button class="btn">ギルド</button>
      <button class="btn">週間</button>
    </div>
  `;
  root.appendChild(hdr);

  const content = el('div');
  content.style.cssText = 'position:absolute; top:80px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns: 1fr 320px; gap:16px;';
  root.appendChild(content);

  // Podium
  const podium = el('div');
  podium.style.cssText = 'display:flex; gap:16px; align-items:flex-end; justify-content:center; padding-top:40px;';
  const top3 = [
    { rank:1, name:'ほのお', species:'dragon', stage:3, gold:129800, player:'ドラゴンの民' },
    { rank:2, name:'りり', species:'unicorn', stage:3, gold:82410, player:'天馬' },
    { rank:3, name:'ごん', species:'golem', stage:2, gold:64200, player:'ろく' },
  ];
  const heights = { 1:280, 2:220, 3:180 };
  const colors = { 1:'#f5e4b3', 2:'#dbe8dd', 3:'#f0d5b0' };
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  const order = [2,1,3];
  order.forEach(r=>{
    const p = top3.find(x=>x.rank===r);
    const col = el('div','panel');
    col.style.cssText = `width:200px; height:${heights[r]}px; background:${colors[r]}; padding:12px; display:flex; flex-direction:column; align-items:center; gap:6px; position:relative;`;
    col.innerHTML = `<div style="font-size:40px;">${medals[r]}</div>`;
    const petC = PixelPet.createPetCanvas(p.species, p.stage, 96);
    col.appendChild(petC);
    const info = el('div','',`<div style="font-weight:700; font-size:14px;">${p.name}</div><div style="font-size:11px; color:var(--ink-2);">${p.player}</div><div style="margin-top:4px; font-family:'Press Start 2P'; font-size:12px;">${p.gold.toLocaleString()} G</div>`);
    col.appendChild(info);
    podium.appendChild(col);
  });

  const leftCol = el('div');
  leftCol.appendChild(podium);
  // Rest of list below podium
  const list = el('div','panel');
  list.style.cssText = 'margin-top:20px; padding: 10px 14px; background:var(--paper); max-height:240px; overflow-y:auto;';
  const more = [
    [4,'くろ',42100],[5,'あん',38900],[6,'ぴこ',35500],[7,'わた',30220],[8,'れい',28400],[9,'たに',26100],[10,'むぎ',25200],
  ];
  list.innerHTML = more.map(r=>`
    <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed var(--ink-3); font-size:13px;">
      <span><b>#${r[0]}</b> &nbsp; ${r[1]}</span>
      <span style="font-family:'Press Start 2P'; font-size:11px;">${r[2].toLocaleString()} G</span>
    </div>
  `).join('') + `
    <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px; background:#f5e4b3; margin:6px -14px -10px; padding:6px 14px; border-top:2px solid var(--accent);">
      <span><b>#42</b> &nbsp; あなた</span>
      <span style="font-family:'Press Start 2P'; font-size:11px;">${GAME.coin.toLocaleString()} G</span>
    </div>
  `;
  leftCol.appendChild(list);
  content.appendChild(leftCol);

  // Right: your achievements
  const side = el('div','panel');
  side.style.cssText = 'background:var(--paper); padding:14px;';
  side.innerHTML = `
    <div style="font-weight:700; font-size:14px; margin-bottom:10px;">🎖 実績</div>
    ${[
      ['🥇','初めての金貨','解除済み'],
      ['💰','お金持ち','解除済み'],
      ['💎','大富豪','10,000G'],
      ['⭐','Lv.5達成','解除済み'],
      ['🌟','Lv.10達成','解除済み'],
      ['📦','コレクター','64/100'],
      ['⚡','スキルマスター','4/5'],
    ].map(a=>`
      <div style="display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px dashed var(--ink-3); opacity:${a[2]==='解除済み'?1:0.7}">
        <div style="font-size:22px;">${a[0]}</div>
        <div style="flex:1;">
          <div style="font-size:13px; font-weight:600">${a[1]}</div>
          <div style="font-size:10px; color:var(--ink-2)">${a[2]}</div>
        </div>
        ${a[2]==='解除済み'?'<span style="color:var(--accent-2); font-size:14px;">✔</span>':''}
      </div>
    `).join('')}
  `;
  content.appendChild(side);
});

// ==============================
// 🛋️ FURNITURE SHOP — Catalog
// ==============================
registerScene('furniture', (root) => {
  root.style.background = 'var(--paper)';
  const hdr = el('div');
  hdr.style.cssText = 'position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center;';
  hdr.innerHTML = `
    <div>
      <div style="font-size:20px; font-weight:700;">🛋️ インテリアショップ</div>
      <div style="font-size:11px; color:var(--ink-2);">お部屋をもっとかわいく</div>
    </div>
    <div style="display:flex; gap:6px;">
      <button class="btn primary">すべて</button>
      <button class="btn">床</button>
      <button class="btn">壁</button>
      <button class="btn">新着</button>
      <button class="btn">安い順</button>
      <button class="btn">高い順</button>
    </div>
  `;
  root.appendChild(hdr);

  const grid = el('div');
  grid.style.cssText = 'position:absolute; top:76px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(2, 1fr); gap:12px;';
  root.appendChild(grid);

  const items = [
    ['🪴','観葉植物',100,'床左'],
    ['🪔','ランプ',150,'床左'],
    ['🧸','ぬいぐるみ',180,'床右'],
    ['🟥','カーペット',200,'床中央'],
    ['📚','本棚',250,'壁左'],
    ['🕰️','時計',280,'壁中央'],
    ['🖼️','絵画',300,'壁右'],
    ['📺','テレビ',350,'壁左'],
    ['🐠','水槽',400,'壁右'],
    ['🛋️','ソファ',500,'床右'],
  ];
  items.forEach(it => {
    const c = el('div','panel');
    c.style.cssText = 'background:var(--paper-2); padding:12px; display:flex; flex-direction:column; align-items:center; gap:6px; position:relative; cursor:pointer;';
    c.innerHTML = `
      <div style="flex:1; width:100%; background:#fff; border:2px dashed var(--ink-3); border-radius:8px; display:grid; place-items:center; min-height:90px;">
        <div style="font-size:52px;">${it[0]}</div>
      </div>
      <div style="font-weight:700; font-size:13px;">${it[1]}</div>
      <div style="font-size:10px; color:var(--ink-2);">${it[3]}スロット</div>
      <button class="btn primary" style="width:100%; padding:6px;">🪙 ${it[2]} G で購入</button>
    `;
    c.querySelector('button').addEventListener('click', (e)=>{
      e.stopPropagation();
      if (GAME.coin < it[2]) { GAME.toast('コインが足りません'); return; }
      GAME.setCoin(GAME.coin - it[2]);
      GAME.toast(`${it[0]} ${it[1]} を購入！`);
    });
    grid.appendChild(c);
  });
});

// ==============================
// 👫 FRIEND ROOM — visit banner
// ==============================
registerScene('friend', (root) => {
  const time = GAME.time;
  root.style.background = { day:'#f4e9cf', dusk:'#f0c8a0', night:'#4a4870' }[time];

  // Top visit banner
  const banner = el('div');
  banner.style.cssText = `position:absolute; top:0; left:0; right:0; height:44px; background:var(--accent-2); color:#fff; display:flex; align-items:center; padding:0 16px; gap:14px; z-index:5; border-bottom:2px solid var(--ink);`;
  banner.innerHTML = `
    <span style="font-size:20px;">👫</span>
    <span style="font-weight:700;">もふ さんの部屋をおじゃま中</span>
    <span style="font-size:11px; opacity:0.8;">フレンド歴 3週間 · 最終ログイン 2時間前</span>
    <span style="flex:1"></span>
    <button class="btn" style="padding:4px 12px; font-size:12px;" data-act="back">◀ 自分の部屋へ戻る</button>
  `;
  banner.querySelector('[data-act="back"]').addEventListener('click',()=>showScene('room'));
  root.appendChild(banner);

  // Room view (similar to overhead room but simpler)
  const room = el('div');
  room.style.cssText = 'position:absolute; top:44px; bottom:76px; left:0; right:0;';
  root.appendChild(room);

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 1080 500');
  svg.style.cssText = 'width:100%; height:100%;';
  svg.innerHTML = `
    <polygon points="540,40 920,200 920,120 540,-40" fill="#dbe8dd" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 160,200 160,120 540,-40" fill="#c5d9c8" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 920,240 540,440 160,240" fill="#c8b38a" stroke="#2a2420" stroke-width="2"/>
    <!-- Friend's furniture -->
    <g transform="translate(240, 60)"><rect width="72" height="96" fill="#8a5a3a" stroke="#2a2420" stroke-width="2"/><rect x="4" y="6" width="64" height="28" fill="#7a6cab"/><rect x="4" y="36" width="64" height="28" fill="#c8553d"/><rect x="4" y="66" width="64" height="28" fill="#d4a24c"/></g>
    <g transform="translate(500, 70)"><rect width="80" height="50" fill="#2a2420" stroke="#2a2420"/><rect x="4" y="4" width="72" height="42" fill="#7fb3c8"/><text x="40" y="30" font-size="12" fill="#fff" text-anchor="middle">TV</text></g>
    <g transform="translate(720, 70)"><rect width="90" height="60" fill="#7fb3c8" stroke="#2a2420" stroke-width="2"/><rect y="0" width="90" height="8" fill="#2a2420"/></g>
    <polygon points="540,240 720,340 540,440 360,340" fill="#d4a24c" stroke="#2a2420" stroke-width="2"/>
    <g transform="translate(300,260)">
      <ellipse cy="32" rx="18" ry="6" fill="#2a2420" opacity="0.2"/>
      <rect x="-10" y="10" width="20" height="18" fill="#8a5a3a" stroke="#2a2420"/>
      <path d="M -14 10 Q -6 -20 4 -8 Q 14 -20 14 8 Z" fill="#6b8e7f" stroke="#2a2420"/>
    </g>
  `;
  room.appendChild(svg);

  // Friend's pet (always show a unicorn for this demo)
  const friendPet = el('div');
  friendPet.style.cssText = 'position:absolute; left:50%; top:56%; transform:translate(-50%,-50%); z-index:3;';
  const petC = PixelPet.createPetCanvas('unicorn', 2, 180);
  friendPet.appendChild(petC);
  const label = el('div');
  label.style.cssText = 'text-align:center; margin-top:6px; font-size:12px; font-weight:700; background:#fff; border:1.5px solid var(--ink); border-radius:8px; padding:2px 10px; display:inline-block; position:absolute; left:50%; bottom:-14px; transform:translateX(-50%); white-space:nowrap;';
  label.textContent = 'りり (ユニコーン Lv.18)';
  friendPet.appendChild(label);
  room.appendChild(friendPet);

  // Dock with limited actions
  const dock = el('div');
  dock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:56px; background:var(--paper-2); border:2px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); display:flex; align-items:center; padding:0 14px; gap:10px;`;
  dock.innerHTML = `
    <button class="btn primary">👋 なでる</button>
    <button class="btn">🎁 プレゼント</button>
    <button class="btn">💬 話す</button>
    <button class="btn">📝 足跡を残す</button>
    <div style="flex:1"></div>
    <div style="font-size:11px; color:var(--ink-2);">※ 訪問中は家具・回収不可</div>
  `;
  root.appendChild(dock);

  // Click pet = animate
  friendPet.addEventListener('click', () => {
    const em = el('div'); em.textContent = '💕';
    em.style.cssText = 'position:absolute; left:50%; top:10%; transform:translateX(-50%); font-size:28px; animation: emote 1.2s forwards;';
    friendPet.appendChild(em); setTimeout(()=>em.remove(), 1300);
    GAME.toast('りり は よろこんでいる！');
  });
});

