import { createPetCanvas } from './pixelpet'
import type { Species } from '../types'
import type { GameState } from './sceneGame'
import { fetchRanking, playLottery } from './api'
import { FURNITURE_TABLE } from '../data/furniture'
import { usePlayerStore } from '../store/playerStore'
import { io } from 'socket.io-client'

type Root = HTMLElement

function el(tag: string, cls?: string, html?: string): HTMLElement {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html != null) e.innerHTML = html
  return e
}


function showStatusBubble(parent: HTMLElement, x: number, y: number, game: GameState): HTMLElement {
  const p = game.pet
  const names: Record<string, string> = { dragon:'ドラゴン', unicorn:'ユニコーン', slime:'スライム', phoenix:'フェニックス', golem:'ゴーレム' }
  const stagenames = ['','ちび','通常','最終形態']
  const b = el('div','status-pop')
  b.style.left = x+'px'; b.style.top = y+'px'
  b.innerHTML = `
    <div class="nm">${p.name} <span style="font-weight:400;color:var(--ink-2);font-size:11px">${names[p.species]} · ${stagenames[p.stage]}</span></div>
    <div>♥ 幸福</div><div class="bar"><span class="hap" style="width:${Math.round(p.hap*100)}%"></span></div>
    <div>🍚 空腹</div><div class="bar"><span class="hun" style="width:${Math.round(p.hun*100)}%"></span></div>
    <div>✦ Lv.${p.lv}</div><div class="bar"><span class="xp" style="width:${Math.round(p.xp*100)}%"></span></div>
  `
  parent.appendChild(b)
  return b
}

// ── ROOM ──────────────────────────────────────────────────────────────────
export function buildRoom(root: Root, game: GameState, _showScene: (k: string) => void) {
  const time = game.time
  const skyBase  = { day:'#f4e9cf', dusk:'#f0c8a0', night:'#4a4870' }[time]
  const floorA   = { day:'#d8c39c', dusk:'#c8a27a', night:'#6b6080' }[time]
  const floorB   = { day:'#c8b38a', dusk:'#b8906a', night:'#5c5272' }[time]
  const wallColor= { day:'#ede6d4', dusk:'#dfbea0', night:'#595478' }[time]

  root.style.background = skyBase

  // Pet stats topbar
  const stageNames = ['','ちび','通常','最終']
  const topbar = el('div')
  topbar.style.cssText = `position:absolute; top:0; left:0; right:0; height:36px; background:${wallColor}; border-bottom:2px solid var(--ink); display:flex; align-items:center; padding:0 14px; gap:14px; font-size:12px; z-index:5;`
  topbar.innerHTML = `
    <span style="font-weight:700">🐣 ${game.pet.name} <span style="color:var(--ink-2); font-weight:400">Lv.${game.pet.lv} · ${stageNames[game.pet.stage]}</span></span>
    <span style="color:var(--ink-2)">ドロップまで <b id="dropCd">42</b> s</span>
    <span style="margin-left:auto; color:var(--ink-2); font-size:11px">※ ペットをクリックで詳細</span>
  `
  root.appendChild(topbar)

  // Iso room SVG
  const room = el('div')
  room.style.cssText = 'position:absolute; inset:36px 0 84px 0;'
  root.appendChild(room)

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 500')
  svg.setAttribute('preserveAspectRatio','xMidYMid meet')
  svg.style.cssText = 'width:100%; height:100%; display:block;'
  svg.innerHTML = `
    <polygon points="540,40 920,200 920,120 540,-40" fill="${wallColor}" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 160,200 160,120 540,-40" fill="${wallColor}" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 920,240 540,440 160,240" fill="${floorA}" stroke="#2a2420" stroke-width="2"/>
    ${(()=>{let s='';for(let i=1;i<6;i++){const t=i/6;const x1=160+(540-160)*t,y1=240-(240-40)*t;const x2=540+(920-540)*t,y2=40+(240-40)*t;s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${floorB}" opacity="0.6"/>`;} return s;})()}
    <g transform="translate(240, 60)">
      <rect x="0" y="0" width="72" height="96" fill="#8a5a3a" stroke="#2a2420" stroke-width="2"/>
      <rect x="4" y="6" width="64" height="22" fill="#d4a24c"/>
      <rect x="4" y="32" width="64" height="22" fill="#c8553d"/>
      <rect x="4" y="58" width="64" height="22" fill="#6b8e7f"/>
    </g>
    <g transform="translate(500, 60)">
      <circle cx="30" cy="30" r="26" fill="#ede6d4" stroke="#2a2420" stroke-width="2"/>
      <circle cx="30" cy="30" r="3" fill="#2a2420"/>
      <line x1="30" y1="30" x2="30" y2="14" stroke="#2a2420" stroke-width="2"/>
      <line x1="30" y1="30" x2="42" y2="30" stroke="#2a2420" stroke-width="2"/>
    </g>
    <g transform="translate(720, 70)">
      <rect x="0" y="0" width="90" height="60" fill="#7fb3c8" stroke="#2a2420" stroke-width="2"/>
      <rect x="0" y="0" width="90" height="8" fill="#2a2420"/>
    </g>
    <polygon points="540,240 720,340 540,440 360,340" fill="#c8553d" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,270 680,340 540,410 400,340" fill="none" stroke="#f5e4b3" stroke-width="1.5" stroke-dasharray="4 3"/>
    <g transform="translate(300,260)">
      <ellipse cx="0" cy="32" rx="18" ry="6" fill="#2a2420" opacity="0.2"/>
      <path d="M -10 28 L -12 10 L 12 10 L 10 28 Z" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
      <path d="M -16 10 Q -10 -20 -2 -10 Q 4 -24 8 -8 Q 16 -18 14 0 Q 20 -2 14 10 Z" fill="#6b8e7f" stroke="#2a2420" stroke-width="1.5"/>
    </g>
    <g transform="translate(740,310)">
      <polygon points="0,0 80,40 80,70 0,30" fill="#7a6cab" stroke="#2a2420" stroke-width="2"/>
      <polygon points="0,0 12,6 12,-18 0,-24" fill="#7a6cab" stroke="#2a2420" stroke-width="2"/>
      <polygon points="0,-24 12,-18 80,22 68,16" fill="#9b8cca" stroke="#2a2420" stroke-width="2"/>
    </g>
    <g id="drops"></g>
  `
  room.appendChild(svg)

  // Pet canvas overlay
  const petWrap = document.createElement('div')
  petWrap.style.cssText = 'position:absolute; left:50%; top:58%; transform:translate(-50%,-50%); cursor:pointer; z-index:3;'
  petWrap.appendChild(createPetCanvas(game.pet.species as Species, game.pet.stage, 160))
  room.appendChild(petWrap)

  let currentBubble: HTMLElement | null = null
  petWrap.addEventListener('click', () => {
    if (currentBubble) { currentBubble.remove(); currentBubble = null; return }
    const rect = petWrap.getBoundingClientRect()
    const parentRect = room.getBoundingClientRect()
    currentBubble = showStatusBubble(room, (rect.left-parentRect.left)+rect.width, rect.top-parentRect.top-110, game)
    setTimeout(() => { if (currentBubble) { currentBubble.remove(); currentBubble = null } }, 5000)
  })

  // アイテムIDから絵文字へのマッピング
  const ITEM_EMOJI: Record<string, string> = {
    dragon_scale:'🔸', dragon_claw:'🐉',
    unicorn_hair:'✨', unicorn_dust:'🌟',
    slime_gel:'💚', slime_core:'💎',
    phoenix_feather:'🪶', phoenix_tear:'💧',
    golem_stone:'🪨', golem_core:'⚙️',
  }

  // 実際のドロップアイテムをストアから描画
  let prevDropCount = game.droppedItems.length

  function renderDrops() {
    room.querySelectorAll('.drop-item').forEach(e => e.remove())
    game.droppedItems.forEach((d) => {
      const emoji = ITEM_EMOJI[d.itemId] ?? '✨'
      const dEl = el('button', 'drop-item')
      dEl.style.cssText = `position:absolute; left:${d.x}%; top:${d.y}%; transform:translate(-50%,-50%); width:44px; height:44px; border-radius:50%; border:2px solid var(--ink); background:#f5e4b3; box-shadow:3px 3px 0 var(--ink); cursor:pointer; font-size:20px; z-index:2;`
      dEl.textContent = emoji
      dEl.title = `${d.name} (+${d.sellPrice}G)`
      dEl.addEventListener('click', (ev) => {
        ev.stopPropagation()
        game.collectItem(d.id)
        game.toast(`${emoji} ${d.name} を回収！`)
      })
      room.appendChild(dEl)
    })
  }
  renderDrops()

  // ストア変更を購読して再描画
  const unsub = game.subscribe(() => {
    const curr = game.droppedItems.length
    if (curr > prevDropCount) {
      dropCdSec = 30 + Math.floor(Math.random() * 30)
      game.toast('✨ 新しいドロップ！')
    }
    prevDropCount = curr
    renderDrops()
  })
  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = unsub

  // ドロップカウントダウン表示
  let dropCdSec = 45
  const cdEl = topbar.querySelector<HTMLElement>('#dropCd')
  const cdTimer = setInterval(() => {
    dropCdSec = Math.max(0, dropCdSec - 1)
    if (cdEl && cdEl.isConnected) cdEl.textContent = String(dropCdSec)
    else clearInterval(cdTimer)
  }, 1000)

  // Action dock
  const dock = el('div')
  dock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:60px; background:var(--paper-2); border:2px solid var(--ink); border-radius:14px; box-shadow:4px 4px 0 var(--ink); display:flex; align-items:center; padding:0 14px; gap:10px; z-index:5;`
  dock.innerHTML = `
    <button class="btn primary" data-action="feed">🍎 エサをあげる</button>
    <button class="btn" data-action="pet">👋 なでる</button>
    <button class="btn sage" data-action="skill">✨ スキル発動</button>
    <button class="btn" data-action="collect">🧹 一括回収</button>
    <div style="flex:1"></div>
    <button class="btn mustard" data-action="sell">💰 まとめ売り</button>
    <button class="btn" data-action="detail">📜 ペット詳細</button>
  `
  root.appendChild(dock)

  function playEmote(em: string) {
    const emote = el('div')
    emote.textContent = em
    emote.style.cssText = `position:absolute; left:50%; top:52%; transform:translateX(-50%); font-size:28px; z-index:6; pointer-events:none; animation: emote 1.2s forwards;`
    room.appendChild(emote)
    setTimeout(() => emote.remove(), 1300)
  }

  function openPetDetail() {
    const overlay = el('div')
    overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.4); display:grid; place-items:center; z-index:100;'
    const stageNamesD = ['','ちび','通常','最終形態']
    const speciesName: Record<string, string> = { dragon:'ドラゴン',unicorn:'ユニコーン',slime:'スライム',phoenix:'フェニックス',golem:'ゴーレム' }
    const inner = el('div','panel')
    inner.style.cssText = 'width:580px; padding:20px; background:var(--paper);'
    inner.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h2 style="margin:0; font-size:18px;">📜 ${game.pet.name} の詳細</h2>
        <button class="btn" data-close>✕</button>
      </div>
      <div style="display:grid; grid-template-columns:160px 1fr; gap:16px;">
        <div id="detailPet"></div>
        <div>
          <div><b>種族:</b> ${speciesName[game.pet.species]}</div>
          <div><b>進化:</b> ${stageNamesD[game.pet.stage]} (Lv.${game.pet.lv})</div>
          <div style="margin-top:10px">♥ 幸福</div>
          <div class="bar"><span class="hap" style="width:${game.pet.hap*100}%"></span></div>
          <div>🍚 空腹</div>
          <div class="bar"><span class="hun" style="width:${game.pet.hun*100}%"></span></div>
          <div>✦ XP</div>
          <div class="bar"><span class="xp" style="width:${game.pet.xp*100}%"></span></div>
        </div>
      </div>
    `
    inner.querySelector('#detailPet')!.appendChild(createPetCanvas(game.pet.species as Species, game.pet.stage, 160))
    ;(inner.querySelector('[data-close]') as HTMLElement).addEventListener('click', () => overlay.remove())
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
    overlay.appendChild(inner)
    root.appendChild(overlay)
  }

  dock.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
    if (!b) return
    const a = b.dataset.action
    if (a === 'feed')  { game.feedPet(); game.toast('🍎 おいしい！') }
    if (a === 'pet')   { game.petPet(); game.toast('💕 うれしい！'); playEmote('💕') }
    if (a === 'skill') { game.toast('🔥 スキル発動！'); playEmote('🔥') }
    if (a === 'collect') {
      const items = game.droppedItems
      if (items.length > 0) {
        items.forEach(d => game.collectItem(d.id))
        game.toast(`🧹 ${items.length}個 全部回収！`)
      } else {
        game.toast('回収できるものはありません')
      }
    }
    if (a === 'sell') {
      const total = game.inventoryTotal()
      if (total > 0) { game.sellAll(); game.toast(`💰 +${total.toLocaleString()}G まとめ売り！`) }
      else game.toast('売れるものがありません')
    }
    if (a === 'detail') openPetDetail()
  })

  if (!document.getElementById('roomAnims')) {
    const st = document.createElement('style'); st.id='roomAnims'
    st.textContent = `@keyframes float{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-5px)}} @keyframes emote{from{transform:translateX(-50%) translateY(0);opacity:0}30%{opacity:1}to{transform:translateX(-50%) translateY(-50px);opacity:0}}`
    document.head.appendChild(st)
  }
}

// ── PARK ──────────────────────────────────────────────────────────────────
export function buildPark(root: Root, game: GameState) {
  const time = game.time
  const sky = { day:'linear-gradient(180deg,#c8e4f0 0%,#e8f4da 70%)', dusk:'linear-gradient(180deg,#f0a878 0%,#f5d290 80%)', night:'linear-gradient(180deg,#2a3058 0%,#4a4870 80%)' }[time]
  root.style.background = sky

  // 背景SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 600')
  svg.setAttribute('preserveAspectRatio','xMidYMax slice')
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;'
  const nightTint = time==='night' ? ' opacity="0.6"' : ''
  svg.innerHTML = `
    <path d="M 0 340 Q 200 280 400 330 Q 600 280 800 320 Q 1000 290 1080 330 L 1080 600 L 0 600 Z" fill="#b5d5a0" stroke="#2a2420" stroke-width="2"${nightTint}/>
    <path d="M 0 400 Q 200 350 400 390 Q 600 340 800 380 Q 1000 350 1080 390 L 1080 600 L 0 600 Z" fill="#9bc585" stroke="#2a2420" stroke-width="2"${nightTint}/>
    <path d="M -20 480 Q 540 440 1100 480" fill="none" stroke="#d4a24c" stroke-width="36" stroke-linecap="round"/>
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
      </g>
    </g>
    <g transform="translate(540, 420)">
      <rect x="-40" y="0" width="80" height="8" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
      <rect x="-40" y="8" width="6" height="18" fill="#8a5a3a" stroke="#2a2420"/>
      <rect x="34" y="8" width="6" height="18" fill="#8a5a3a" stroke="#2a2420"/>
      <rect x="-40" y="-14" width="80" height="6" fill="#8a5a3a" stroke="#2a2420" stroke-width="1.5"/>
    </g>
    ${time!=='night' ? `<g opacity="0.9"><ellipse cx="200" cy="100" rx="38" ry="14" fill="#fff"/><ellipse cx="230" cy="92" rx="28" ry="12" fill="#fff"/><ellipse cx="800" cy="80" rx="44" ry="16" fill="#fff"/></g>` : ''}
    ${time==='night' ? `<g>${Array.from({length:30}).map((_,i)=>{const x=(i*137)%1080,y=(i*97)%250;return `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`}).join('')}<circle cx="900" cy="120" r="28" fill="#f5e4b3" stroke="#2a2420"/></g>` : ''}
  `
  root.appendChild(svg)

  const petLayer = el('div')
  petLayer.style.cssText = 'position:absolute; inset:0 0 92px 0; pointer-events:none;'
  root.appendChild(petLayer)

  // ── ペット描画ヘルパー ──
  const PET_SIZE = 80
  type PeerData = { id: string; name: string; species: string; level: number; x: number; y: number }
  const peers = new Map<string, { data: PeerData; wrapper: HTMLElement; chatTimer?: ReturnType<typeof setTimeout> }>()

  function stageFromLevel(lv: number) { return lv >= 50 ? 3 : lv >= 20 ? 2 : 1 }

  function makePetWrapper(data: PeerData, isYou: boolean): HTMLElement {
    const w = el('div')
    w.style.cssText = `position:absolute; width:${PET_SIZE}px; display:flex; flex-direction:column; align-items:center; pointer-events:auto; cursor:pointer; user-select:none;`
    const canvas = createPetCanvas(data.species as Species, stageFromLevel(data.level), PET_SIZE)
    w.appendChild(canvas)
    const lbl = el('div')
    lbl.style.cssText = `background:${isYou?'var(--accent)':'var(--paper)'}; color:${isYou?'#fff':'var(--ink)'}; border:1.5px solid var(--ink); border-radius:8px; padding:1px 8px; font-size:11px; font-weight:700; white-space:nowrap; margin-top:2px;`
    lbl.textContent = data.name + (isYou ? ' (you)' : '')
    w.appendChild(lbl)

    // ホバーでステータス表示
    w.addEventListener('mouseenter', () => {
      let bub = w.querySelector<HTMLElement>('.park-status')
      if (bub) return
      bub = el('div','park-status')
      bub.style.cssText = `position:absolute; bottom:${PET_SIZE+30}px; left:50%; transform:translateX(-50%); background:#fff; border:2px solid var(--ink); border-radius:10px; padding:6px 12px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap; z-index:20; pointer-events:none;`
      bub.innerHTML = `<b>${data.name}</b><br>Lv.${data.level} · ${data.species}`
      w.appendChild(bub)
    })
    w.addEventListener('mouseleave', () => {
      w.querySelector('.park-status')?.remove()
    })
    return w
  }

  function showChatBubble(wrapper: HTMLElement, message: string, chatTimer?: ReturnType<typeof setTimeout>) {
    if (chatTimer) clearTimeout(chatTimer)
    let bub = wrapper.querySelector<HTMLElement>('.chat-bub')
    if (!bub) {
      bub = el('div','chat-bub')
      bub.style.cssText = `position:absolute; bottom:${PET_SIZE+30}px; left:50%; transform:translateX(-50%); background:#fff; border:2px solid var(--ink); border-radius:10px; padding:5px 10px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap; z-index:10; pointer-events:none;`
      wrapper.insertBefore(bub, wrapper.firstChild)
    }
    bub.textContent = message
    return setTimeout(() => bub?.remove(), 5000)
  }

  function setPetPos(wrapper: HTMLElement, x: number, y: number, bobOffset: number) {
    wrapper.style.left = (x - PET_SIZE / 2) + 'px'
    wrapper.style.top  = (y - PET_SIZE - bobOffset) + 'px'
  }

  // ── 自分のペット ──
  const youData: PeerData = { id: game.playerId, name: game.pet.name, species: game.pet.species, level: game.pet.lv, x: 540, y: 420 }
  const youWrapper = makePetWrapper(youData, true)
  petLayer.appendChild(youWrapper)

  // ── Socket.io接続 ──
  const BASE_URL = (import.meta as { env: Record<string,string> }).env.VITE_API_URL ?? ''
  const socket = io(BASE_URL + '/park', { transports: ['websocket','polling'] })

  socket.on('connect', () => {
    socket.emit('join', { id: game.playerId, name: game.pet.name, species: game.pet.species, level: game.pet.lv, scene: 'park' })
  })

  function updateCount() {
    const countEl = root.querySelector<HTMLElement>('#parkCount')
    if (countEl) countEl.textContent = `● オンライン ${peers.size + 1} 人`
  }

  socket.on('players', (players: PeerData[]) => {
    players.forEach(p => {
      if (p.id === game.playerId) return
      const w = makePetWrapper(p, false)
      petLayer.appendChild(w)
      peers.set(p.id, { data: p, wrapper: w })
    })
    updateCount()
  })

  socket.on('player:join', (p: PeerData) => {
    if (p.id === game.playerId || peers.has(p.id)) return
    const w = makePetWrapper(p, false)
    petLayer.appendChild(w)
    peers.set(p.id, { data: p, wrapper: w })
    updateCount()
  })

  socket.on('player:leave', ({ id }: { id: string }) => {
    const peer = peers.get(id)
    if (peer) { peer.wrapper.querySelectorAll('canvas').forEach((c: Element) => (c as HTMLCanvasElement & { destroy?: () => void }).destroy?.()); peer.wrapper.remove() }
    peers.delete(id)
    updateCount()
  })

  socket.on('player:move', ({ id, x, y }: { id: string; x: number; y: number }) => {
    const peer = peers.get(id)
    if (peer) { peer.data.x = x; peer.data.y = y }
  })

  socket.on('park:chat', ({ id, message }: { id: string; message: string }) => {
    if (id === socket.id) {
      const timer = showChatBubble(youWrapper, message)
      void timer
      return
    }
    const peer = Array.from(peers.values()).find(p => p.data.id === id)
    if (peer) {
      peer.chatTimer = showChatBubble(peer.wrapper, message, peer.chatTimer)
    }
  })

  // ── アニメーションループ ──
  let rafId = 0
  let lastMoveEmit = 0

  function tick() {
    const now = performance.now()
    const bob = Math.sin(now / 500) * 3

    // 自分
    setPetPos(youWrapper, youData.x, youData.y, bob)

    // 他プレイヤー
    peers.forEach(peer => {
      setPetPos(peer.wrapper, peer.data.x, peer.data.y, Math.sin(now / 500 + peer.data.x * 0.01) * 3)
    })

    // move を 100ms ごとに送信
    if (now - lastMoveEmit > 100) {
      socket.emit('move', { x: youData.x, y: youData.y })
      lastMoveEmit = now
    }

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  // ── キーボード移動 ──
  const keyState = new Set<string>()
  const keyHandler = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    if (e.key === 'ArrowLeft')  { youData.x -= 16; e.preventDefault() }
    if (e.key === 'ArrowRight') { youData.x += 16; e.preventDefault() }
    youData.x = Math.max(60, Math.min(1000, youData.x))
  }
  window.addEventListener('keydown', keyHandler)
  void keyState

  // ── チャットドック ──
  const chatDock = el('div')
  chatDock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:60px; background:var(--paper-2); border:2px solid var(--ink); border-radius:14px; box-shadow:4px 4px 0 var(--ink); padding:0 14px; z-index:10; display:flex; align-items:center; gap:10px;`
  chatDock.innerHTML = `
    <span style="font-weight:700; font-size:13px;">💬 チャット</span>
    <span style="color:var(--ink-2); font-size:11px;">(← → で移動 / 60文字まで)</span>
    <input id="chatInput" type="text" maxlength="60" placeholder="メッセージを入力…" style="flex:1; padding:8px 12px; border:2px solid var(--ink); border-radius:8px; font-family:inherit; font-size:13px; background:#fff;" />
    <button class="btn primary" id="chatSend">送信</button>
    <span id="parkCount" style="color:var(--ink-2); font-size:11px;">● オンライン 1 人</span>
  `
  root.appendChild(chatDock)

  const chatInput = chatDock.querySelector<HTMLInputElement>('#chatInput')!
  const chatSend  = chatDock.querySelector<HTMLButtonElement>('#chatSend')!

  function sendChat() {
    const msg = chatInput.value.trim()
    if (!msg) return
    socket.emit('chat', msg)
    showChatBubble(youWrapper, msg)
    chatInput.value = ''
  }

  chatInput.addEventListener('keydown', e => {
    e.stopPropagation()
    if (e.key === 'Enter') sendChat()
  })
  chatSend.addEventListener('click', sendChat)

  // ── クリーンアップ ──
  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    socket.disconnect()
    cancelAnimationFrame(rafId)
    window.removeEventListener('keydown', keyHandler)
  }
}

// ── DUNGEON ────────────────────────────────────────────────────────────────
export function buildDungeon(root: Root, game: GameState, showScene: (k: string) => void) {
  root.style.background = 'radial-gradient(circle at center, #3a3248 0%, #1d2026 100%)'

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 600')
  svg.setAttribute('preserveAspectRatio','xMidYMid slice')
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;'
  svg.innerHTML = `
    <rect x="0" y="0" width="1080" height="340" fill="#2a2e36"/>
    <g stroke="#1d2026" stroke-width="2" fill="none">
      ${(()=>{let s='';for(let y=40;y<340;y+=50)for(let x=(y/50%2?0:25);x<1080;x+=50)s+=`<rect x="${x}" y="${y}" width="50" height="50"/>`;return s;})()}
    </g>
    <g transform="translate(140, 60)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>
    <g transform="translate(940, 60)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>
    <polygon points="0,340 1080,340 1080,600 0,600" fill="#1d2026"/>
    <g stroke="#353a44" stroke-width="1.5">
      <line x1="540" y1="340" x2="0" y2="600"/><line x1="540" y1="340" x2="1080" y2="600"/>
      <line x1="0" y1="400" x2="1080" y2="400"/><line x1="0" y1="470" x2="1080" y2="470"/><line x1="0" y1="540" x2="1080" y2="540"/>
    </g>
  `
  root.appendChild(svg)

  const topbar = el('div')
  topbar.style.cssText = `position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; z-index:5;`
  topbar.innerHTML = `
    <div class="panel" style="padding:8px 14px; background:var(--paper); font-weight:700;">🗺️ フロア <span style="color:var(--accent)">F3</span> · Wave <b>2/3</b></div>
    <div class="panel" style="padding:8px 14px; background:var(--paper); font-size:12px;">累計勝利 <b>17</b> · 次のボスまで <b>3F</b></div>
    <button class="btn" data-act="retreat">🏃 撤退</button>
  `
  root.appendChild(topbar)

  const enemyHp = { cur:82, max:120 }
  const enemyBox = el('div')
  enemyBox.style.cssText = `position:absolute; right:180px; top:160px; z-index:3; text-align:center; width:240px;`
  enemyBox.innerHTML = `
    <div style="font-size:100px; margin-bottom:8px;">👹</div>
    <div style="color:#f5e4b3; font-weight:700; font-size:16px;">オーク Lv.8</div>
    <div style="background:rgba(0,0,0,0.4); border:2px solid #f5e4b3; border-radius:8px; padding:4px; margin-top:6px; width:200px; margin-left:auto; margin-right:auto;">
      <div style="height:10px; background:#2a2420; border-radius:4px; overflow:hidden;">
        <div id="ehp" style="height:100%; background:#c8553d; width:${enemyHp.cur/enemyHp.max*100}%"></div>
      </div>
      <div style="color:#fff; font-size:10px; font-family:'Press Start 2P';">${enemyHp.cur}/${enemyHp.max}</div>
    </div>
  `
  root.appendChild(enemyBox)

  const petBox = el('div')
  petBox.style.cssText = `position:absolute; left:180px; top:280px; z-index:3; text-align:center;`
  petBox.appendChild(createPetCanvas(game.pet.species as Species, game.pet.stage, 160))
  const petLabel = el('div','',`<div style="color:#f5e4b3; font-weight:700; font-size:16px;">${game.pet.name} (あなた)</div>`)
  petBox.appendChild(petLabel)
  root.appendChild(petBox)

  const php = { cur:92, max:100 }
  const hpSide = el('div','panel')
  hpSide.style.cssText = `position:absolute; right:16px; bottom:140px; padding:12px; background:var(--paper); width:220px; z-index:4; font-size:13px;`
  hpSide.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px;">あなたのペット</div>
    <div>HP <b id="phpTxt">${php.cur}/${php.max}</b></div>
    <div class="bar" style="height:10px;"><span id="phpBar" style="background:#6b8e7f; width:${php.cur/php.max*100}%"></span></div>
    <div style="margin-top:10px; color:var(--ink-2); font-size:11px;">次の敵攻撃まで</div>
    <div class="bar" style="height:6px;"><span id="atkBar" style="background:var(--accent-3); width:40%"></span></div>
  `
  root.appendChild(hpSide)

  const cmd = el('div','panel')
  cmd.style.cssText = `position:absolute; left:16px; right:250px; bottom:16px; padding:14px; background:var(--paper); display:grid; grid-template-columns:repeat(4,1fr); gap:10px; z-index:4;`
  cmd.innerHTML = `
    <button class="btn primary" style="padding:16px; font-size:14px;" data-cmd="attack"><span style="font-size:22px">⚔️</span> 攻撃</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="skill"><span style="font-size:22px">✨</span> スキル</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="item"><span style="font-size:22px">🍎</span> アイテム</button>
    <button class="btn" style="padding:16px; font-size:14px;" data-cmd="defend"><span style="font-size:22px">🛡️</span> 防御</button>
  `
  root.appendChild(cmd)

  function showDmg(x: number, y: number, val: number, color='#c8553d') {
    if (!document.getElementById('dungAnim')) {
      const st = document.createElement('style'); st.id='dungAnim'
      st.textContent = `@keyframes dmg{from{transform:translateY(0);opacity:0}20%{opacity:1}to{transform:translateY(-40px);opacity:0}} @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`
      document.head.appendChild(st)
    }
    const d = el('div')
    d.textContent = `-${val}`
    d.style.cssText = `position:absolute; left:${x}px; top:${y}px; color:${color}; font-family:'Press Start 2P'; font-size:26px; text-shadow:2px 2px 0 #000; z-index:20; animation:dmg 1s forwards;`
    root.appendChild(d)
    setTimeout(() => d.remove(), 1000)
  }

  cmd.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd]')
    if (!b) return
    const act = b.dataset.cmd
    if (act==='attack') {
      const dmg = 10+Math.floor(Math.random()*20)
      enemyHp.cur = Math.max(0, enemyHp.cur-dmg)
      root.querySelector<HTMLElement>('#ehp')!.style.width = (enemyHp.cur/enemyHp.max*100)+'%'
      showDmg(780, 220, dmg)
      enemyBox.style.animation='shake 0.3s'; setTimeout(()=>enemyBox.style.animation='', 300)
      if (enemyHp.cur<=0) { game.toast('🏆 勝利！ +150G +XP40'); game.setCoin(game.coin+150) }
    } else if (act==='item') {
      php.cur = Math.min(php.max, php.cur+30)
      root.querySelector<HTMLElement>('#phpBar')!.style.width=(php.cur/php.max*100)+'%'
      root.querySelector<HTMLElement>('#phpTxt')!.textContent=`${php.cur}/${php.max}`
      game.toast('🍎 回復薬を使った (+30HP)')
    } else if (act==='skill') {
      enemyHp.cur = Math.max(0, enemyHp.cur-35)
      root.querySelector<HTMLElement>('#ehp')!.style.width=(enemyHp.cur/enemyHp.max*100)+'%'
      showDmg(800, 200, 35, '#d4a24c')
      game.toast('🔥 火炎ブレス！')
    } else if (act==='defend') {
      game.toast('🛡️ 防御の構え')
    }
  })

  topbar.querySelector<HTMLElement>('[data-act="retreat"]')!.addEventListener('click', () => {
    game.toast('🏃 自室に戻ります')
    setTimeout(() => showScene('room'), 600)
  })

  let atkCd = 0
  const atk = setInterval(() => {
    atkCd += 2
    const bar = root.querySelector<HTMLElement>('#atkBar')
    if (bar) bar.style.width = atkCd+'%'
    if (atkCd >= 100) {
      atkCd = 0
      const dmg = 5+Math.floor(Math.random()*12)
      php.cur = Math.max(0, php.cur-dmg)
      const pbar = root.querySelector<HTMLElement>('#phpBar')
      const ptxt = root.querySelector<HTMLElement>('#phpTxt')
      if (pbar) pbar.style.width=(php.cur/php.max*100)+'%'
      if (ptxt) ptxt.textContent=`${php.cur}/${php.max}`
      showDmg(280, 320, dmg, '#fff')
      petBox.style.animation='shake 0.3s'; setTimeout(()=>petBox.style.animation='', 300)
    }
    if (!root.isConnected) clearInterval(atk)
  }, 100)
}

// ── LOTTERY ────────────────────────────────────────────────────────────────
export function buildLottery(root: Root, game: GameState) {
  root.style.background = 'linear-gradient(180deg,#f7e1c0 0%,#e8c89a 100%)'

  const hdr = el('div')
  hdr.style.cssText = `position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center; z-index:4;`
  hdr.innerHTML = `
    <div style="font-size:18px; font-weight:700;">🎰 宝くじ店「幸運堂」</div>
    <div style="font-size:12px; color:var(--ink-2);">今日の運勢: <b style="color:var(--accent)">★★★☆☆</b> / 本日の獲得: <b>+1,200 G</b></div>
  `
  root.appendChild(hdr)

  const grid = el('div')
  grid.style.cssText = `position:absolute; top:64px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;`
  root.appendChild(grid)

  // Garapon
  const pA = el('div','panel')
  pA.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;'
  pA.innerHTML = `
    <div style="width:100%; background:var(--accent); color:#fff; padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">🎲 ガラポン</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">伝統のガラガラ抽選<br/>1回 100G</div>
    <div style="position:relative; width:200px; height:200px; display:grid; place-items:center;">
      <div class="drum" style="width:170px; height:170px; background:#f5e4b3; border:4px solid var(--ink); border-radius:50%; display:grid; place-items:center; box-shadow:4px 4px 0 var(--ink); transition:transform 1s cubic-bezier(.2,.7,.3,1);"><div style="font-size:54px;">🎲</div></div>
    </div>
    <button class="btn primary" data-act="garapon" style="width:100%; padding:10px;">🪙 100G で引く</button>
    <button class="btn" data-act="garapon10" style="width:100%;">10連 (1,000G)</button>
    <div style="font-size:11px; color:var(--ink-2); text-align:center;">🏆 1% · 🎊 9% · 🎉 30% · 😢 60%</div>
  `
  grid.appendChild(pA)

  // Scratch
  const pB = el('div','panel')
  pB.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;'
  const symbols = ['💎','🪙','⭐','🔔','🍀','🐉']
  let scratchReveal = Array.from({length:6}, () => symbols[Math.floor(Math.random()*symbols.length)])
  pB.innerHTML = `
    <div style="width:100%; background:var(--accent-2); color:#fff; padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">✏️ スクラッチ</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">削ってそろえる<br/>1枚 100G</div>
    <div style="width:100%; background:#f5e4b3; border:2px solid var(--ink); border-radius:10px; padding:10px;">
      <div style="font-size:10px; text-align:center; color:var(--ink-2); font-family:'Press Start 2P'">TICKET #00342</div>
      <div class="scratch-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:6px;">
        ${Array.from({length:6}).map((_,i)=>`<div class="sc-cell" data-i="${i}" style="aspect-ratio:1; background:#9a8f85; border:2px solid var(--ink); border-radius:6px; display:grid; place-items:center; font-size:24px; cursor:pointer; color:#fff; font-weight:700; user-select:none;">?</div>`).join('')}
      </div>
    </div>
    <button class="btn primary" data-act="scratch" style="width:100%;">🪙 100G 新しい券</button>
    <div style="font-size:11px; color:var(--ink-2); text-align:center;">同じ絵柄3つで当たり</div>
  `
  grid.appendChild(pB)

  // Slot
  const pC = el('div','panel')
  pC.style.cssText = 'background:var(--paper); padding:16px; display:flex; flex-direction:column; align-items:center; gap:10px;'
  pC.innerHTML = `
    <div style="width:100%; background:var(--accent-3); padding:4px 8px; font-weight:700; text-align:center; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink);">🎰 スロット</div>
    <div style="font-size:12px; color:var(--ink-2); text-align:center;">3リール・派手演出<br/>1回 100G</div>
    <div style="display:flex; gap:6px; background:var(--ink); padding:8px; border-radius:10px;">
      ${[0,1,2].map(i=>`<div class="reel" data-r="${i}" style="width:60px; height:90px; background:#fff; border:2px solid var(--ink); border-radius:6px; display:grid; place-items:center; font-size:36px;">🐉</div>`).join('')}
    </div>
    <button class="btn primary" data-act="spin" style="width:100%; padding:12px; font-size:15px;">▶ SPIN (100G)</button>
    <div style="font-size:11px; color:var(--ink-2); text-align:center;">3つそろうと🏆 / 2つで🎉</div>
  `
  grid.appendChild(pC)

  async function callLottery(type: string): Promise<{ ok: boolean; result: unknown } | { error: string }> {
    return playLottery(game.playerId, type)
  }

  function syncCoin() {
    game.coin = usePlayerStore.getState().money
    usePlayerStore.setState({ money: game.coin })
  }

  pA.querySelector<HTMLElement>('[data-act="garapon"]')!.addEventListener('click', async () => {
    if (game.coin < 100) { game.toast('コイン不足'); return }
    const drum = pA.querySelector<HTMLElement>('.drum')!
    drum.style.transform = `rotate(${720+Math.random()*360}deg)`
    const res = await callLottery('garapon')
    setTimeout(() => { drum.style.transform = 'rotate(0deg)' }, 1500)
    if ('error' in res) { game.toast(res.error); return }
    const r = (res as { result: { label: string; prize: number } }).result
    game.toast(`${r.label}${r.prize ? ' +'+r.prize+'G' : ''}`)
    game.setCoin(usePlayerStore.getState().money - 100 + r.prize)
    syncCoin()
  })

  pA.querySelector<HTMLElement>('[data-act="garapon10"]')!.addEventListener('click', async () => {
    if (game.coin < 1000) { game.toast('コイン不足'); return }
    const res = await callLottery('garapon10')
    if ('error' in res) { game.toast(res.error); return }
    const r = (res as { result: { totalPrize: number } }).result
    game.toast(`🎁 10連結果: +${r.totalPrize}G`)
    game.setCoin(usePlayerStore.getState().money - 1000 + r.totalPrize)
    syncCoin()
  })

  pB.querySelector<HTMLElement>('[data-act="scratch"]')!.addEventListener('click', async () => {
    if (game.coin < 100) { game.toast('コイン不足'); return }
    const res = await callLottery('scratch')
    if ('error' in res) { game.toast(res.error); return }
    const r = (res as { result: { cards: string[]; prize: number } }).result
    scratchReveal = r.cards
    pB.querySelectorAll<HTMLElement>('.sc-cell').forEach(c => {
      c.style.background = '#9a8f85'; c.textContent = '?'
      delete (c.dataset as Record<string,unknown>).done
    })
    if (r.prize > 0) game.toast(`🎊 3つそろい！ +${r.prize}G`)
    game.setCoin(usePlayerStore.getState().money - 100 + r.prize)
    syncCoin()
  })

  pB.querySelectorAll<HTMLElement>('.sc-cell').forEach(c => {
    c.addEventListener('click', () => {
      if (c.dataset.done) return
      c.dataset.done = 'y'
      const i = parseInt(c.dataset.i!, 10)
      c.style.background = 'var(--paper-2)'; c.style.color = 'var(--ink)'
      c.textContent = scratchReveal[i]
    })
  })

  pC.querySelector<HTMLElement>('[data-act="spin"]')!.addEventListener('click', async () => {
    if (game.coin < 100) { game.toast('コイン不足'); return }
    const spinBtn = pC.querySelector<HTMLButtonElement>('[data-act="spin"]')!
    spinBtn.disabled = true
    const reels = pC.querySelectorAll<HTMLElement>('.reel')
    const symbols = ['💎','🪙','⭐','🔔','🍀','🐉']
    const res = await callLottery('slot')
    if ('error' in res) { game.toast(res.error); spinBtn.disabled = false; return }
    const r = (res as { result: { reels: string[]; prize: number } }).result
    reels.forEach((reel, i) => {
      let n = 0; const steps = 20 + i * 10
      const tick = setInterval(() => {
        reel.textContent = symbols[Math.floor(Math.random() * symbols.length)]; n++
        if (n >= steps) {
          clearInterval(tick); reel.textContent = r.reels[i]
          if (i === 2) {
            if (r.prize === 5000) game.toast('🏆 ALL MATCH! +5,000G')
            else if (r.prize === 200) game.toast('🎉 2つそろい +200G')
            else game.toast('😢 ハズレ')
            game.setCoin(usePlayerStore.getState().money - 100 + r.prize)
            syncCoin()
            spinBtn.disabled = false
          }
        }
      }, 60)
    })
  })
}

// ── RANKING ────────────────────────────────────────────────────────────────
export function buildRanking(root: Root, game: GameState) {
  root.style.background = 'linear-gradient(180deg,#f7e8c0 0%,#efdba0 100%)'

  const hdr = el('div')
  hdr.style.cssText = 'position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center;'
  hdr.innerHTML = `
    <div>
      <div style="font-size:20px; font-weight:700;">🏆 所持金ランキング</div>
      <div id="rankCount" style="font-size:11px; color:var(--ink-2);">読み込み中...</div>
    </div>
  `
  root.appendChild(hdr)

  const content = el('div')
  content.style.cssText = 'position:absolute; top:70px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns:1fr 320px; gap:16px;'
  root.appendChild(content)

  const leftCol = el('div')
  leftCol.style.cssText = 'display:flex; flex-direction:column; gap:16px; overflow:hidden;'
  content.appendChild(leftCol)

  const podiumWrap = el('div')
  podiumWrap.style.cssText = 'display:flex; gap:16px; align-items:flex-end; justify-content:center; padding-top:20px; flex:1;'
  leftCol.appendChild(podiumWrap)

  const listWrap = el('div','panel')
  listWrap.style.cssText = 'padding:10px 14px; background:var(--paper); overflow-y:auto; max-height:200px;'
  leftCol.appendChild(listWrap)

  const side = el('div','panel')
  side.style.cssText = 'background:var(--paper); padding:14px; overflow-y:auto;'
  side.innerHTML = `<div style="font-weight:700; font-size:14px; margin-bottom:10px;">🎖 あなたの記録</div>
    <div id="myRecord" style="font-size:13px; color:var(--ink-2);">読み込み中...</div>
  `
  content.appendChild(side)

  const heights: Record<number,number> = {1:260,2:200,3:160}
  const colors:  Record<number,string> = {1:'#f5e4b3',2:'#dbe8dd',3:'#f0d5b0'}
  const medals:  Record<number,string> = {1:'🥇',2:'🥈',3:'🥉'}

  fetchRanking().then(ranking => {
    if (!root.isConnected) return
    const countEl = root.querySelector<HTMLElement>('#rankCount')
    if (countEl) countEl.textContent = `全 ${ranking.length} 人`

    const top3 = ranking.slice(0, 3)
    const rest  = ranking.slice(3)

    // Podium
    const order = [1, 0, 2] // 2位, 1位, 3位の順で表示
    order.forEach(idx => {
      const p = top3[idx]
      if (!p) return
      const rank = idx + 1
      const species = (p.species ?? 'dragon') as Species
      const level = p.level ?? 1
      const stage = level >= 50 ? 3 : level >= 20 ? 2 : 1
      const col = el('div','panel')
      col.style.cssText = `width:180px; height:${heights[rank]}px; background:${colors[rank]}; padding:10px; display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0;`
      const medalEl = el('div','',`<div style="font-size:32px;">${medals[rank]}</div>`)
      col.appendChild(medalEl)
      col.appendChild(createPetCanvas(species, stage, 80))
      const info = el('div','',`<div style="font-weight:700; font-size:13px; margin-top:4px;">${p.name}</div><div style="font-family:'Press Start 2P'; font-size:10px; margin-top:2px;">${p.money.toLocaleString()} G</div>`)
      info.style.textAlign = 'center'
      col.appendChild(info)
      podiumWrap.appendChild(col)
    })

    // List (4位以降)
    const myRank = ranking.findIndex(r => r.id === game.playerId) + 1
    listWrap.innerHTML = rest.map((r, i) =>
      `<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed var(--ink-3); font-size:12px; ${r.id===game.playerId?'background:#f5e4b3;margin:0 -14px;padding:5px 14px;':''}">
        <span><b>#${i+4}</b> &nbsp; ${r.name}</span>
        <span style="font-family:'Press Start 2P';font-size:10px;">${r.money.toLocaleString()} G</span>
      </div>`
    ).join('')

    // My record
    const myData = ranking.find(r => r.id === game.playerId)
    const myRecordEl = root.querySelector<HTMLElement>('#myRecord')
    if (myRecordEl) {
      myRecordEl.innerHTML = myData
        ? `<div style="padding:8px; background:var(--paper-2); border-radius:8px; margin-bottom:8px;">
            <div style="font-weight:700;">あなたのランク</div>
            <div style="font-size:20px; font-weight:700; color:var(--accent); margin:4px 0;">#${myRank}</div>
            <div style="font-family:'Press Start 2P'; font-size:11px;">${myData.money.toLocaleString()} G</div>
          </div>`
        : '<div>ランキング圏外</div>'
    }
  })
}

// ── FURNITURE ──────────────────────────────────────────────────────────────
export function buildFurniture(root: Root, game: GameState) {
  root.style.background = 'var(--paper)'

  const SLOT_LABEL: Record<string, string> = {
    'floor-left':'床左', 'floor-center':'床中央', 'floor-right':'床右',
    'wall-left':'壁左', 'wall-center':'壁中央', 'wall-right':'壁右',
  }

  const hdr = el('div')
  hdr.style.cssText = 'position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center;'
  hdr.innerHTML = `
    <div>
      <div style="font-size:20px; font-weight:700;">🛋️ インテリアショップ</div>
      <div style="font-size:11px; color:var(--ink-2);">お部屋をもっとかわいく</div>
    </div>
    <div id="furniMoney" style="font-family:'Press Start 2P'; font-size:13px;">🪙 ${game.coin.toLocaleString()} G</div>
  `
  root.appendChild(hdr)

  const grid = el('div')
  grid.style.cssText = 'position:absolute; top:76px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(2,1fr); gap:12px;'
  root.appendChild(grid)

  function renderGrid() {
    grid.innerHTML = ''
    FURNITURE_TABLE.forEach(it => {
      const c = el('div','panel')
      c.style.cssText = 'background:var(--paper-2); padding:12px; display:flex; flex-direction:column; align-items:center; gap:6px;'
      const canAfford = game.coin >= it.price
      c.innerHTML = `
        <div style="flex:1; width:100%; background:#fff; border:2px dashed var(--ink-3); border-radius:8px; display:grid; place-items:center; min-height:80px;">
          <div style="font-size:48px;">${it.emoji}</div>
        </div>
        <div style="font-weight:700; font-size:12px;">${it.name}</div>
        <div style="font-size:10px; color:var(--ink-2);">${SLOT_LABEL[it.slot] ?? it.slot}</div>
        <button class="btn primary" style="width:100%; padding:5px; font-size:12px; ${canAfford?'':'opacity:0.5;'}">
          🪙 ${it.price} G
        </button>
      `
      c.querySelector<HTMLElement>('button')!.addEventListener('click', e => {
        e.stopPropagation()
        const ok = game.buyFurniture(it.furnitureId)
        if (!ok) { game.toast('コインが足りません'); return }
        game.toast(`${it.emoji} ${it.name} を購入！`)
        const moneyEl = root.querySelector<HTMLElement>('#furniMoney')
        if (moneyEl) moneyEl.textContent = `🪙 ${usePlayerStore.getState().money.toLocaleString()} G`
        renderGrid()
      })
      grid.appendChild(c)
    })
  }
  renderGrid()
}

// ── FRIEND ROOM ────────────────────────────────────────────────────────────
export function buildFriendRoom(root: Root, game: GameState, showScene: (k: string) => void) {
  const time = game.time
  root.style.background = { day:'#f4e9cf', dusk:'#f0c8a0', night:'#4a4870' }[time]

  const banner = el('div')
  banner.style.cssText = `position:absolute; top:0; left:0; right:0; height:44px; background:var(--accent-2); color:#fff; display:flex; align-items:center; padding:0 16px; gap:14px; z-index:5; border-bottom:2px solid var(--ink);`
  banner.innerHTML = `
    <span style="font-size:20px;">👫</span>
    <span style="font-weight:700;">もふ さんの部屋をおじゃま中</span>
    <span style="flex:1"></span>
    <button class="btn" style="padding:4px 12px; font-size:12px;" data-act="back">◀ 自分の部屋へ戻る</button>
  `
  banner.querySelector<HTMLElement>('[data-act="back"]')!.addEventListener('click', () => showScene('room'))
  root.appendChild(banner)

  const room = el('div')
  room.style.cssText = 'position:absolute; top:44px; bottom:76px; left:0; right:0;'
  root.appendChild(room)

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 500')
  svg.style.cssText = 'width:100%; height:100%;'
  svg.innerHTML = `
    <polygon points="540,40 920,200 920,120 540,-40" fill="#dbe8dd" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 160,200 160,120 540,-40" fill="#c5d9c8" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,40 920,240 540,440 160,240" fill="#c8b38a" stroke="#2a2420" stroke-width="2"/>
    <polygon points="540,240 720,340 540,440 360,340" fill="#d4a24c" stroke="#2a2420" stroke-width="2"/>
  `
  room.appendChild(svg)

  const friendPet = el('div')
  friendPet.style.cssText = 'position:absolute; left:50%; top:56%; transform:translate(-50%,-50%); z-index:3; cursor:pointer;'
  friendPet.appendChild(createPetCanvas('unicorn', 2, 160))
  const label = el('div')
  label.style.cssText = 'text-align:center; margin-top:6px; font-size:12px; font-weight:700; background:#fff; border:1.5px solid var(--ink); border-radius:8px; padding:2px 10px; display:inline-block; position:absolute; left:50%; bottom:-14px; transform:translateX(-50%); white-space:nowrap;'
  label.textContent = 'りり (ユニコーン Lv.18)'
  friendPet.appendChild(label)
  room.appendChild(friendPet)

  friendPet.addEventListener('click', () => { game.toast('りり は よろこんでいる！') })

  const dock = el('div')
  dock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:56px; background:var(--paper-2); border:2px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); display:flex; align-items:center; padding:0 14px; gap:10px;`
  dock.innerHTML = `
    <button class="btn primary">👋 なでる</button>
    <button class="btn">🎁 プレゼント</button>
    <button class="btn">💬 話す</button>
    <div style="flex:1"></div>
    <div style="font-size:11px; color:var(--ink-2);">※ 訪問中は家具・回収不可</div>
  `
  root.appendChild(dock)
}
