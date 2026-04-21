import { createPetCanvas } from './pixelpet'
import type { Species } from '../types'
import type { GameState } from './sceneGame'
import { fetchRanking, fetchBoard, postBoard, playLottery } from './api'
import { bgm, RADIO_TRACKS } from './bgm'
import { FURNITURE_TABLE } from '../data/furniture'
import { FOOD_TABLE, FOOD_CATEGORIES } from '../data/foods'
import { usePlayerStore } from '../store/playerStore'
import { usePetStore } from '../store/petStore'
import { io } from 'socket.io-client'

type Root = HTMLElement

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function el(tag: string, cls?: string, html?: string): HTMLElement {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html != null) e.innerHTML = html
  return e
}


// ── 掲示板モーダル ────────────────────────────────────────────────────────────
export function openBoard(scene: string, playerId: string) {
  if (document.getElementById('boardModal')) return

  const overlay = el('div','')
  overlay.id = 'boardModal'
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2000;display:flex;align-items:center;justify-content:center;'

  const panel = el('div','panel')
  panel.style.cssText = 'width:480px;max-width:92vw;max-height:80vh;display:flex;flex-direction:column;gap:10px;padding:20px;background:var(--paper);border:2px solid var(--ink);border-radius:16px;box-shadow:6px 6px 0 var(--ink);'
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <b style="font-size:16px;">📋 掲示板</b>
      <button id="boardClose" style="font-size:18px;background:none;border:none;cursor:pointer;line-height:1;">✕</button>
    </div>
    <div id="boardPosts" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;min-height:120px;max-height:400px;"></div>
    <div style="display:flex;gap:8px;">
      <input id="boardInput" type="text" maxlength="200" placeholder="メッセージ（200文字まで）"
        style="flex:1;padding:8px 12px;border:2px solid var(--ink);border-radius:8px;font-family:inherit;font-size:13px;" />
      <button class="btn primary" id="boardSend">投稿</button>
    </div>
  `
  overlay.appendChild(panel)
  document.body.appendChild(overlay)

  const postsEl = panel.querySelector<HTMLElement>('#boardPosts')!
  const input   = panel.querySelector<HTMLInputElement>('#boardInput')!

  function renderPosts(posts: { player_name: string; message: string; created_at: string }[]) {
    if (posts.length === 0) {
      postsEl.innerHTML = '<div style="color:var(--ink-2);font-size:13px;text-align:center;padding:24px;">まだ書き込みがありません</div>'
      return
    }
    postsEl.innerHTML = posts.map(p => {
      const d = new Date(p.created_at)
      const dateStr = `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
      return `<div style="background:var(--paper-2);border:1.5px solid var(--ink);border-radius:10px;padding:8px 12px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-2);margin-bottom:3px;">
          <b>${esc(p.player_name)}</b><span>${esc(dateStr)}</span>
        </div>
        <div style="font-size:13px;word-break:break-all;">${esc(p.message)}</div>
      </div>`
    }).join('')
  }

  fetchBoard(scene).then(renderPosts)

  async function sendPost() {
    const msg = input.value.trim()
    if (!msg) return
    input.value = ''
    await postBoard(scene, playerId, msg)
    fetchBoard(scene).then(renderPosts)
  }

  panel.querySelector('#boardSend')!.addEventListener('click', sendPost)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendPost() })
  panel.querySelector('#boardClose')!.addEventListener('click', () => overlay.remove())
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove() })
}

// 公園・ラジオ用: ワールドオブジェクトとして掲示板を配置
function addBoardObject(root: Root, scene: string, playerId: string) {
  const obj = el('div')
  obj.style.cssText = 'position:absolute;left:820px;bottom:128px;z-index:6;cursor:pointer;text-align:center;transition:transform 0.15s;user-select:none;'
  obj.innerHTML = `
    <div style="display:inline-block;">
      <div style="background:#d4a24c;border:3px solid #8a5a3a;border-radius:6px;padding:6px 10px;box-shadow:3px 3px 0 #5a3a1a;font-size:11px;font-weight:700;color:#2a2420;line-height:1.4;min-width:52px;">
        📋<br><span style="font-size:10px;">掲示板</span>
      </div>
      <div style="width:6px;height:28px;background:#8a5a3a;margin:0 auto;border-left:1px solid #5a3a1a;"></div>
    </div>
  `
  obj.addEventListener('click', () => openBoard(scene, playerId))
  obj.addEventListener('mouseenter', () => { obj.style.transform = 'scale(1.08)' })
  obj.addEventListener('mouseleave', () => { obj.style.transform = '' })
  root.appendChild(obj)
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

// ── 共通: エサメニューモーダル ────────────────────────────────────────────
function openFoodMenuModal(root: HTMLElement, game: GameState, onUse: (foodItemId: string, emoji: string) => void) {
  const existing = root.querySelector('#foodMenuOverlay')
  if (existing) { existing.remove(); return }

  const overlay = el('div')
  overlay.id = 'foodMenuOverlay'
  overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.4); display:grid; place-items:center; z-index:100;'

  const panel = el('div','panel')
  panel.style.cssText = 'width:560px; max-height:75vh; display:flex; flex-direction:column; background:var(--paper); padding:16px; gap:10px;'

  let activeCategory = FOOD_CATEGORIES[0].id

  function renderFoodPanel() {
    const ps = usePlayerStore.getState()
    const foodInv = ps.foodInventory
    const countMap = new Map<string, number>()
    for (const item of foodInv) countMap.set(item.foodId, (countMap.get(item.foodId) ?? 0) + 1)

    let invHtml = ''
    if (countMap.size > 0) {
      invHtml = `<div style="background:var(--paper-2); border:1.5px solid var(--ink-3); border-radius:10px; padding:10px;">
        <p style="font-size:11px; font-weight:700; color:var(--ink-2); margin:0 0 6px;">🎒 所持中のエサ（クリックで使用）</p>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">`
      for (const [foodId, cnt] of countMap.entries()) {
        const m = FOOD_TABLE.find(f => f.foodId === foodId)!
        const item = foodInv.find(f => f.foodId === foodId)!
        invHtml += `<button class="btn primary" data-use="${item.id}" style="font-size:12px; position:relative; padding:5px 10px;">
          ${m.emoji} ${esc(m.name)}
          <span style="position:absolute; top:-6px; right:-6px; background:#e74c3c; color:#fff; border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center;">${cnt}</span>
        </button>`
      }
      invHtml += `</div></div>`
    } else {
      invHtml = `<div style="background:var(--paper-2); border:1.5px dashed var(--ink-3); border-radius:10px; padding:10px; font-size:12px; color:var(--ink-2); text-align:center;">所持中のエサはありません。下のショップで購入してください。</div>`
    }

    const tabHtml = `<div style="display:flex; gap:4px; flex-wrap:wrap;">` +
      FOOD_CATEGORIES.map(c => `<button data-tab="${c.id}" style="padding:4px 10px; border-radius:20px; border:1.5px solid var(--ink); font-size:11px; font-weight:700; cursor:pointer; background:${c.id === activeCategory ? 'var(--accent)' : 'var(--paper-2)'}; color:${c.id === activeCategory ? '#fff' : 'var(--ink)'};">${c.label}</button>`).join('') + `</div>`

    const filtered = FOOD_TABLE.filter(f => f.category === activeCategory)
    let shopHtml = `<div style="overflow-y:auto; flex:1;"><div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">`
    for (const food of filtered) {
      const canAfford = ps.money >= food.price
      const owned = countMap.get(food.foodId) ?? 0
      shopHtml += `<button class="btn" data-buy="${food.foodId}" style="display:flex; align-items:center; gap:6px; padding:7px 10px; ${canAfford ? '' : 'opacity:0.45;'}">
        <span style="font-size:20px;">${food.emoji}</span>
        <span style="flex:1; text-align:left; font-size:12px;">${esc(food.name)}</span>
        ${owned > 0 ? `<span style="background:#27ae60; color:#fff; border-radius:10px; padding:1px 6px; font-size:10px; font-weight:700;">×${owned}</span>` : ''}
        <span style="font-size:11px; font-weight:700; color:var(--accent); white-space:nowrap;">🪙${food.price}G</span>
      </button>`
    }
    shopHtml += `</div></div>`

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0; font-size:16px;">🍽️ エサをあげる</h2>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:12px; color:var(--ink-2);">🪙 ${ps.money.toLocaleString()}G</span>
          <button class="btn" id="foodClose">✕</button>
        </div>
      </div>
      ${invHtml}
      <p style="font-size:11px; font-weight:700; color:var(--ink-2); margin:0;">🛒 ショップ</p>
      ${tabHtml}
      ${shopHtml}
    `

    panel.querySelector('#foodClose')!.addEventListener('click', () => overlay.remove())
    panel.querySelectorAll<HTMLElement>('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => { activeCategory = btn.dataset.tab as typeof activeCategory; renderFoodPanel() })
    })
    panel.querySelectorAll<HTMLElement>('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.use!
        const item = usePlayerStore.getState().foodInventory.find(f => f.id === id)
        const m = FOOD_TABLE.find(f => f.foodId === item?.foodId)
        onUse(id, m?.emoji ?? '🍎')
        overlay.remove()
        game.toast(`${m?.emoji ?? '🍎'} ${m?.name ?? 'エサ'} を床に置いた！`)
      })
    })
    panel.querySelectorAll<HTMLElement>('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = btn.dataset.buy!
        const ok = usePlayerStore.getState().buyFood(foodId)
        const food = FOOD_TABLE.find(f => f.foodId === foodId)
        if (!ok) { game.toast('コインが足りません'); return }
        game.toast(`${food?.emoji} ${food?.name} を購入！`)
        renderFoodPanel()
      })
    })
  }

  renderFoodPanel()
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
  overlay.appendChild(panel)
  root.appendChild(overlay)
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
  petWrap.style.cssText = 'position:absolute; cursor:pointer; z-index:3;'
  petWrap.appendChild(createPetCanvas(game.pet.species as Species, game.pet.stage, 160))
  room.appendChild(petWrap)

  // ── ルーム内ペット位置状態 ──
  let petX = 50, petY = 58
  let petTargetX = 50, petTargetY = 58
  let petIdleUntil = performance.now() + 1500
  let petFacing = 1
  let roomRafId = 0

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
  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    cancelAnimationFrame(roomRafId)
    floorFoods.forEach(f => f.cleanup())
    unsub()
  }

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

  // ── 床の餌システム ──────────────────────────────────────────────────────
  type FloorFood = { foodItemId: string; emoji: string; x: number; y: number; el: HTMLElement; cleanup: () => void }
  const floorFoods: FloorFood[] = []

  function placeFood(foodItemId: string, emoji: string) {
    const ix = 5 + Math.random() * 88   // 5–93%
    const iy = 10 + Math.random() * 82  // 10–92%
    const foodEl = el('div')
    foodEl.style.cssText = 'position:absolute; font-size:30px; z-index:4; cursor:grab; user-select:none; filter:drop-shadow(2px 2px 0 rgba(0,0,0,0.25));'
    foodEl.textContent = emoji
    const entry: FloorFood = { foodItemId, emoji, x: ix, y: iy, el: foodEl, cleanup: () => {} }
    function applyPos() {
      foodEl.style.left = entry.x + '%'
      foodEl.style.top = entry.y + '%'
      foodEl.style.transform = 'translate(-50%,-50%)'
    }
    applyPos()
    let dragging = false
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const rect = room.getBoundingClientRect()
      entry.x = Math.max(1, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100))
      entry.y = Math.max(5, Math.min(97, ((e.clientY - rect.top) / rect.height) * 100))
      applyPos()
    }
    const onUp = () => { if (dragging) { dragging = false; foodEl.style.cursor = 'grab' } }
    foodEl.addEventListener('mousedown', (e) => { dragging = true; foodEl.style.cursor = 'grabbing'; e.preventDefault() })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    entry.cleanup = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    room.appendChild(foodEl)
    floorFoods.push(entry)
  }

  // ── ルームRAFループ（ゆったり動き・餌追いかけ） ──────────────────────
  function roomLoop() {
    const now = performance.now()
    const isHungry = game.pet.hun < 1.0

    if (isHungry && floorFoods.length > 0) {
      // 最寄りの餌を探して近づく
      let nearest = floorFoods[0]
      let minDist = Infinity
      for (const f of floorFoods) {
        const dx = f.x - petX, dy = f.y - petY
        if (dx*dx + dy*dy < minDist) { minDist = dx*dx + dy*dy; nearest = f }
      }
      const dx = nearest.x - petX, dy = nearest.y - petY
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < 3) {
        // 食べる
        usePlayerStore.getState().useFood(nearest.foodItemId)
        game.toast(`${nearest.emoji} もぐもぐ！ おいしい！`)
        nearest.el.style.transition = 'transform 0.2s, opacity 0.2s'
        nearest.el.style.transform = 'translate(-50%,-50%) scale(0)'
        nearest.el.style.opacity = '0'
        setTimeout(() => nearest.el.remove(), 220)
        nearest.cleanup()
        floorFoods.splice(floorFoods.indexOf(nearest), 1)
        playEmote('😋')
      } else {
        const speed = 0.15
        petX += (dx / dist) * speed
        petY += (dy / dist) * speed * 0.4
        petFacing = dx > 0 ? 1 : -1
      }
    } else {
      // ゆったりウロウロ（公園より遅い・休憩多め）
      if (now < petIdleUntil) {
        // 休憩中
      } else {
        const dx = petTargetX - petX, dy = petTargetY - petY
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 1.5) {
          petIdleUntil = now + 3000 + Math.random() * 5000
          petTargetX = 5 + Math.random() * 90
          petTargetY = 10 + Math.random() * 80
        } else {
          const speed = 0.065
          petX += (dx / dist) * speed
          petY += (dy / dist) * speed * 0.4
          petFacing = dx > 0 ? 1 : -1
        }
      }
    }

    petX = Math.max(2, Math.min(97, petX))
    petY = Math.max(8, Math.min(94, petY))
    const bob = Math.sin(now / 750) * 3
    petWrap.style.left = petX + '%'
    petWrap.style.top = petY + '%'
    petWrap.style.transform = `translate(-50%, calc(-50% + ${bob}px)) scaleX(${petFacing})`
    roomRafId = requestAnimationFrame(roomLoop)
  }
  roomRafId = requestAnimationFrame(roomLoop)

  function openFoodMenu() {
    openFoodMenuModal(root, game, (foodItemId, emoji) => { placeFood(foodItemId, emoji) })
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
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-weight:700; font-size:15px;" id="petNameDisplay">${game.pet.name}</span>
            <button class="btn" id="renameBtn" style="font-size:11px; padding:2px 8px;">✏️ 改名</button>
          </div>
          <div id="renameForm" style="display:none; margin-bottom:8px; display:flex; gap:6px; align-items:center;">
            <input id="renameInput" type="text" maxlength="16" value="${game.pet.name}"
              style="padding:4px 8px; border:2px solid var(--ink); border-radius:6px; font-family:inherit; font-size:13px; width:120px;" />
            <button class="btn primary" id="renameConfirm" style="font-size:11px;">決定</button>
            <button class="btn" id="renameCancel" style="font-size:11px;">取消</button>
          </div>
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

    const renameBtn     = inner.querySelector<HTMLElement>('#renameBtn')!
    const renameForm    = inner.querySelector<HTMLElement>('#renameForm')!
    const renameInput   = inner.querySelector<HTMLInputElement>('#renameInput')!
    const renameConfirm = inner.querySelector<HTMLElement>('#renameConfirm')!
    const renameCancel  = inner.querySelector<HTMLElement>('#renameCancel')!
    const nameDisplay   = inner.querySelector<HTMLElement>('#petNameDisplay')!

    renameForm.style.display = 'none'

    renameBtn.addEventListener('click', () => {
      renameForm.style.display = 'flex'
      renameBtn.style.display = 'none'
      renameInput.focus()
      renameInput.select()
    })
    renameCancel.addEventListener('click', () => {
      renameForm.style.display = 'none'
      renameBtn.style.display = ''
    })
    const doRename = () => {
      const newName = renameInput.value.trim()
      if (!newName) return
      usePetStore.setState(s => ({ pet: { ...s.pet, name: newName } }))
      nameDisplay.textContent = newName
      const h2 = inner.querySelector('h2')
      if (h2) h2.textContent = `📜 ${newName} の詳細`
      renameForm.style.display = 'none'
      renameBtn.style.display = ''
      game.toast(`✏️ 名前を「${newName}」に変更しました`)
    }
    renameConfirm.addEventListener('click', doRename)
    renameInput.addEventListener('keydown', e => { if (e.key === 'Enter') doRename() })

    ;(inner.querySelector('[data-close]') as HTMLElement).addEventListener('click', () => overlay.remove())
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
    overlay.appendChild(inner)
    root.appendChild(overlay)
  }

  dock.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
    if (!b) return
    const a = b.dataset.action
    if (a === 'feed')  { openFoodMenu() }
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

  // 目標地点ベースの自然な歩行状態
  const X_MIN = 0, X_MAX = 1080
  const Y_MIN = 20, Y_MAX = 580

  type WanderState = {
    x: number; y: number
    targetX: number; targetY: number
    speed: number      // px/frame
    idleUntil: number  // ms: この時刻まで停止
    facing: number     // 1=右 -1=左
    phase: number      // ボブ位相オフセット（rad）
  }

  function randTarget() {
    return { tx: X_MIN + Math.random() * (X_MAX - X_MIN), ty: Y_MIN + Math.random() * (Y_MAX - Y_MIN) }
  }

  function newWanderState(startX?: number): WanderState {
    const x = startX ?? (X_MIN + Math.random() * (X_MAX - X_MIN))
    const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN)
    const { tx, ty } = randTarget()
    return { x, y, targetX: tx, targetY: ty, speed: 0.5 + Math.random() * 0.7, idleUntil: 0, facing: 1, phase: Math.random() * Math.PI * 2 }
  }

  function stepWander(w: WanderState, now: number): number {
    if (now < w.idleUntil) return 0

    const dx = w.targetX - w.x
    const dy = w.targetY - w.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 3) {
      if (Math.random() < 0.3) {
        w.idleUntil = now + 800 + Math.random() * 2500
        return 0
      }
      const t = randTarget()
      w.targetX = t.tx; w.targetY = t.ty
      w.speed = 0.4 + Math.random() * 0.8
    } else {
      w.x += (dx / dist) * w.speed
      w.y += (dy / dist) * w.speed * 0.5  // Y移動は半分の速度（奥行き感）
      w.facing = dx > 0 ? 1 : -1
    }
    return Math.abs(Math.sin((now + w.phase * 300) / 280)) * 5
  }

  const peers = new Map<string, { data: PeerData; wrapper: HTMLElement; wander: WanderState }>()

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
      bub.innerHTML = `<b>${esc(data.name)}</b><br>Lv.${Number(data.level)} · ${esc(String(data.species))}`
      w.appendChild(bub)
    })
    w.addEventListener('mouseleave', () => {
      w.querySelector('.park-status')?.remove()
    })
    return w
  }

  function showChatBubble(wrapper: HTMLElement, message: string) {
    let container = wrapper.querySelector<HTMLElement>('.chat-container')
    if (!container) {
      container = el('div', 'chat-container')
      container.style.cssText = `position:absolute; bottom:${PET_SIZE+30}px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:3px; pointer-events:none; z-index:10;`
      wrapper.insertBefore(container, wrapper.firstChild)
    }
    while (container.children.length >= 3) container.firstElementChild!.remove()
    const bub = el('div', 'chat-bub')
    bub.style.cssText = `background:#fff; border:2px solid var(--ink); border-radius:10px; padding:5px 10px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap;`
    bub.textContent = message
    container.appendChild(bub)
    setTimeout(() => { bub.remove(); if (container && container.children.length === 0) container.remove() }, 5000)
  }

  function setPetPos(wrapper: HTMLElement, x: number, y: number, bobOffset: number) {
    wrapper.style.left = (x - PET_SIZE / 2) + 'px'
    wrapper.style.top  = (y - PET_SIZE - bobOffset) + 'px'
  }

  // ── 自分のペット ──
  const currentPet = game.pet
  const youWander = newWanderState()
  const youData: PeerData = {
    id: game.playerId, name: currentPet.name, species: currentPet.species, level: currentPet.lv,
    x: youWander.x, y: 420,
  }
  const youWrapper = makePetWrapper(youData, true)
  petLayer.appendChild(youWrapper)

  // ── Socket.io接続 ──
  const BASE_URL = (import.meta as { env: Record<string,string> }).env.VITE_API_URL ?? ''
  const socket = io(BASE_URL + '/park', { transports: ['websocket','polling'], auth: { playerId: game.playerId } })

  socket.on('connect', () => {
    socket.emit('join', { id: game.playerId, name: currentPet.name, species: currentPet.species, level: currentPet.lv, scene: 'park' })
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
      peers.set(p.id, { data: p, wrapper: w, wander: newWanderState(p.x) })
    })
    updateCount()
  })

  socket.on('player:join', (p: PeerData) => {
    if (p.id === game.playerId || peers.has(p.id)) return
    const w = makePetWrapper(p, false)
    petLayer.appendChild(w)
    peers.set(p.id, { data: p, wrapper: w, wander: newWanderState(p.x) })
    updateCount()
  })

  socket.on('player:leave', ({ id }: { id: string }) => {
    const peer = peers.get(id)
    if (peer) { peer.wrapper.querySelectorAll('canvas').forEach((c: Element) => (c as HTMLCanvasElement & { destroy?: () => void }).destroy?.()); peer.wrapper.remove() }
    peers.delete(id)
    updateCount()
  })

  socket.on('player:move', ({ id, x }: { id: string; x: number; y: number }) => {
    const peer = peers.get(id)
    // サーバー座標をローカルのwander目標にソフト補正するだけ（急テレポートしない）
    if (peer) peer.wander.targetX = x
  })

  socket.on('park:chat', ({ id, message }: { id: string; message: string }) => {
    if (id === game.playerId) return
    const peer = Array.from(peers.values()).find(p => p.data.id === id)
    if (peer) showChatBubble(peer.wrapper, message)
  })

  // ペットのcanvasに向き反転を適用するヘルパー
  function setFacing(wrapper: HTMLElement, dir: number) {
    const canvas = wrapper.querySelector('canvas')
    if (canvas) canvas.style.transform = dir < 0 ? 'scaleX(-1)' : 'scaleX(1)'
  }

  // ── 公園の床エサシステム ──
  type ParkFloorFood = { foodItemId: string; emoji: string; x: number; y: number; el: HTMLElement; cleanup: () => void }
  const floorFoods: ParkFloorFood[] = []

  function placeParkFood(foodItemId: string, emoji: string) {
    const x = X_MIN + Math.random() * (X_MAX - X_MIN)
    const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN)
    const foodEl = el('div')
    foodEl.style.cssText = `position:absolute; left:${x-18}px; top:${y-18}px; font-size:30px; cursor:grab; user-select:none; pointer-events:auto; filter:drop-shadow(2px 2px 0 rgba(0,0,0,0.3)); z-index:5;`
    foodEl.textContent = emoji
    const entry: ParkFloorFood = { foodItemId, emoji, x, y, el: foodEl, cleanup: () => {} }
    let dragging = false, dragOffX = 0, dragOffY = 0
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const rect = petLayer.getBoundingClientRect()
      entry.x = Math.max(X_MIN, Math.min(X_MAX, (e.clientX - rect.left) - dragOffX))
      entry.y = Math.max(Y_MIN, Math.min(Y_MAX, (e.clientY - rect.top) - dragOffY))
      foodEl.style.left = (entry.x - 18) + 'px'
      foodEl.style.top  = (entry.y - 18) + 'px'
    }
    const onUp = () => { if (dragging) { dragging = false; foodEl.style.cursor = 'grab' } }
    foodEl.addEventListener('mousedown', (e) => {
      dragging = true; foodEl.style.cursor = 'grabbing'; e.preventDefault()
      const rect = petLayer.getBoundingClientRect()
      dragOffX = (e.clientX - rect.left) - entry.x
      dragOffY = (e.clientY - rect.top) - entry.y
    })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    entry.cleanup = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    petLayer.appendChild(foodEl)
    floorFoods.push(entry)
  }

  function eatFood(entry: ParkFloorFood, eaterName: string, isYou: boolean) {
    const idx = floorFoods.indexOf(entry)
    if (idx === -1) return
    floorFoods.splice(idx, 1)
    entry.el.style.transition = 'transform 0.2s, opacity 0.2s'
    entry.el.style.transform = 'scale(0)'
    entry.el.style.opacity = '0'
    setTimeout(() => entry.el.remove(), 220)
    entry.cleanup()
    if (isYou) {
      usePlayerStore.getState().useFood(entry.foodItemId)
      game.toast(`${entry.emoji} もぐもぐ！ おいしい！`)
    } else {
      game.toast(`${entry.emoji} ${eaterName}が食べた！`)
    }
  }

  // ── アニメーションループ ──
  let rafId = 0
  let lastMoveEmit = 0

  function tick() {
    const now = performance.now()

    // 自分 — 空腹なら餌を追う
    const isYouHungry = game.pet.hun < 1.0
    let youBob = 0
    if (isYouHungry && floorFoods.length > 0) {
      const nearest = floorFoods.reduce((a, b) => {
        const da = (a.x-youWander.x)**2+(a.y-youWander.y)**2
        const db = (b.x-youWander.x)**2+(b.y-youWander.y)**2
        return da < db ? a : b
      })
      const dx = nearest.x - youWander.x, dy = nearest.y - youWander.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < 25) {
        eatFood(nearest, youWander.x > 0 ? '' : '', true)
      } else {
        youWander.x += (dx/dist) * 1.5
        youWander.y += (dy/dist) * 0.75
        youWander.facing = dx > 0 ? 1 : -1
      }
      youBob = Math.abs(Math.sin(now/280)) * 5
    } else {
      youBob = stepWander(youWander, now)
    }
    setFacing(youWrapper, youWander.facing)
    setPetPos(youWrapper, youWander.x, youWander.y, youBob)

    // 他プレイヤー — 常に餌を追う（空腹扱い）
    peers.forEach(peer => {
      let bob = 0
      if (floorFoods.length > 0) {
        const nearest = floorFoods.reduce((a, b) => {
          const da = (a.x-peer.wander.x)**2+(a.y-peer.wander.y)**2
          const db = (b.x-peer.wander.x)**2+(b.y-peer.wander.y)**2
          return da < db ? a : b
        })
        const dx = nearest.x - peer.wander.x, dy = nearest.y - peer.wander.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 25) {
          eatFood(nearest, peer.data.name, false)
        } else {
          peer.wander.x += (dx/dist) * 1.5
          peer.wander.y += (dy/dist) * 0.75
          peer.wander.facing = dx > 0 ? 1 : -1
        }
        bob = Math.abs(Math.sin(now/280)) * 5
      } else {
        bob = stepWander(peer.wander, now)
      }
      setFacing(peer.wrapper, peer.wander.facing)
      setPetPos(peer.wrapper, peer.wander.x, peer.wander.y, bob)
    })

    // move を 150ms ごとに送信（サーバー負荷軽減）
    if (now - lastMoveEmit > 150) {
      socket.emit('move', { x: Math.round(youWander.x), y: youWander.y })
      lastMoveEmit = now
    }

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  // ── チャットドック ──
  const chatDock = el('div')
  chatDock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:60px; background:var(--paper-2); border:2px solid var(--ink); border-radius:14px; box-shadow:4px 4px 0 var(--ink); padding:0 14px; z-index:10; display:flex; align-items:center; gap:10px;`
  chatDock.innerHTML = `
    <span style="font-weight:700; font-size:13px;">💬 チャット</span>
    <span style="color:var(--ink-2); font-size:11px;">(← → で移動 / 60文字まで)</span>
    <input id="chatInput" type="text" maxlength="60" placeholder="メッセージを入力…" style="flex:1; padding:8px 12px; border:2px solid var(--ink); border-radius:8px; font-family:inherit; font-size:13px; background:#fff;" />
    <button class="btn primary" id="chatSend">送信</button>
    <button class="btn" id="parkFeedBtn">🍎 エサ</button>
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
  chatDock.querySelector<HTMLElement>('#parkFeedBtn')!.addEventListener('click', () => {
    openFoodMenuModal(root, game, (foodItemId, emoji) => { placeParkFood(foodItemId, emoji) })
  })

  addBoardObject(root, 'park', game.playerId)

  // ── クリーンアップ ──
  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    socket.disconnect()
    cancelAnimationFrame(rafId)
    floorFoods.forEach(f => f.cleanup())
  }
}

// ── DUNGEON ────────────────────────────────────────────────────────────────
export function buildDungeon(root: Root, game: GameState, showScene: (k: string) => void) {
  root.style.background = 'radial-gradient(circle at center, #3a3248 0%, #1d2026 100%)'

  // アニメーション定義
  if (!document.getElementById('dungAnim')) {
    const st = document.createElement('style'); st.id = 'dungAnim'
    st.textContent = `@keyframes dmg{from{transform:translateY(0);opacity:0}20%{opacity:1}to{transform:translateY(-40px);opacity:0}} @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`
    document.head.appendChild(st)
  }

  // ── 背景SVG ──
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 600')
  svg.setAttribute('preserveAspectRatio','xMidYMid slice')
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none;'
  svg.innerHTML = `
    <rect x="0" y="0" width="1080" height="600" fill="#1d2026"/>
    <g stroke="#2a2e36" stroke-width="2" fill="none">
      ${(()=>{let s='';for(let y=0;y<600;y+=50)for(let x=(y/50%2?0:25);x<1080;x+=50)s+=`<rect x="${x}" y="${y}" width="50" height="50"/>`;return s;})()}
    </g>
    <g transform="translate(140,40)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>
    <g transform="translate(940,40)"><rect x="-4" y="0" width="8" height="40" fill="#8a5a3a"/><circle cx="0" cy="-4" r="12" fill="#d4a24c"/><circle cx="0" cy="-4" r="8" fill="#ffeb9a"/></g>
  `
  root.appendChild(svg)

  // ── レイアウト ──
  // 上: フロア情報バー
  const topbar = el('div')
  topbar.style.cssText = 'position:absolute; top:0; left:0; right:0; height:48px; background:#1a1d24; border-bottom:2px solid #353a44; display:flex; align-items:center; padding:0 16px; gap:12px; z-index:10;'
  root.appendChild(topbar)

  // 中央エリア: 左=パーティ 右=敵
  const battleArea = el('div')
  battleArea.style.cssText = 'position:absolute; top:48px; left:0; right:320px; bottom:160px; display:flex; align-items:center; justify-content:space-around; padding:16px;'
  root.appendChild(battleArea)

  // 右サイドバー: 戦闘ログ
  const logPanel = el('div')
  logPanel.style.cssText = 'position:absolute; top:48px; right:0; width:316px; bottom:160px; background:#1a1d24; border-left:2px solid #353a44; display:flex; flex-direction:column; padding:10px; gap:6px; overflow:hidden;'
  logPanel.innerHTML = `<div style="color:#f5e4b3; font-size:12px; font-weight:700; margin-bottom:4px;">📜 バトルログ</div><div id="logList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:4px;"></div>`
  root.appendChild(logPanel)

  // 下: コマンドパネル
  const cmdArea = el('div')
  cmdArea.style.cssText = 'position:absolute; left:0; right:0; bottom:0; height:156px; background:#1a1d24; border-top:2px solid #353a44; padding:12px 16px; display:flex; gap:12px; align-items:center; z-index:10;'
  root.appendChild(cmdArea)

  // ── Socket.io ──
  const BASE_URL = (import.meta as { env: Record<string,string> }).env.VITE_API_URL ?? ''
  const socket = io(BASE_URL + '/dungeon', { transports: ['websocket','polling'], auth: { playerId: game.playerId } })

  type PlayerState = { playerId: string; name: string; species: string; level: number; hp: number; maxHp: number; alive: boolean; defending: boolean }
  type EnemyState  = { name: string; emoji: string; lv: number; hp: number; maxHp: number; atk: number; reward: number }
  type DungeonState = { partyId: string; floor: number; enemy: EnemyState; players: PlayerState[]; currentTurnPlayerId: string | null; phase: string }

  let state: DungeonState | null = null
  let myTurn = false

  function addLog(msg: string, type = 'info') {
    const logList = root.querySelector<HTMLElement>('#logList')
    if (!logList) return
    const c = { victory:'#d4a24c', defeat:'#c8553d', join:'#6b8e7f', floor:'#7fb3c8', info:'#f5e4b3' }[type] ?? '#f5e4b3'
    const entry = el('div')
    entry.style.cssText = `font-size:11px; color:${c}; padding:3px 0; border-bottom:1px solid #2a2e36;`
    entry.textContent = msg
    logList.appendChild(entry)
    logList.scrollTop = logList.scrollHeight
    // 最大50件
    while (logList.children.length > 50) logList.firstElementChild?.remove()
  }

  function showDmgFloat(x: number, y: number, val: number, color = '#c8553d', prefix = '-') {
    const d = el('div')
    d.textContent = `${prefix}${val}`
    d.style.cssText = `position:absolute; left:${x}px; top:${y}px; color:${color}; font-family:'Press Start 2P'; font-size:22px; text-shadow:2px 2px 0 #000; z-index:30; animation:dmg 1s forwards; pointer-events:none;`
    root.appendChild(d)
    setTimeout(() => d.remove(), 1000)
  }

  function renderState(s: DungeonState) {
    state = s
    myTurn = s.currentTurnPlayerId === game.playerId && s.phase === 'battle'

    // ── トップバー ──
    topbar.innerHTML = `
      <div style="color:#f5e4b3; font-family:'Press Start 2P'; font-size:12px;">F${s.floor}</div>
      <div style="color:#aaa; font-size:12px; margin-left:8px;">${s.players.filter(p=>p.alive).length}人パーティ</div>
      <div style="flex:1"></div>
      ${myTurn ? `<div style="color:#d4a24c; font-weight:700; font-size:13px; animation:shake 0.6s infinite;">⚡ あなたのターン！</div>` : `<div style="color:#aaa; font-size:12px;">⏳ ${s.players.find(p=>p.playerId===s.currentTurnPlayerId)?.name ?? '??'} のターン...</div>`}
      <div style="flex:1"></div>
      <button id="retreatBtn" class="btn" style="font-size:12px;">🏃 撤退</button>
    `
    topbar.querySelector('#retreatBtn')!.addEventListener('click', () => {
      socket.emit('dungeon:retreat')
      showScene('room')
    })

    // ── バトルエリア ──
    battleArea.innerHTML = ''

    // 左: パーティ
    const partyCol = el('div')
    partyCol.style.cssText = 'display:flex; flex-direction:column; gap:12px; align-items:center;'
    s.players.forEach(p => {
      const isMe = p.playerId === game.playerId
      const isTurn = p.playerId === s.currentTurnPlayerId
      const card = el('div')
      card.style.cssText = `display:flex; align-items:center; gap:10px; background:${isTurn?'#2a3040':'#1e2230'}; border:2px solid ${isTurn?'#d4a24c':'#353a44'}; border-radius:12px; padding:8px 12px; opacity:${p.alive?1:0.4}; transition:all 0.2s; min-width:200px;`
      const stg = p.level >= 50 ? 3 : p.level >= 20 ? 2 : 1
      const canvas = createPetCanvas(p.species as Species, stg, 48)
      if (!p.alive) canvas.style.filter = 'grayscale(1)'
      card.appendChild(canvas)
      const info = el('div')
      info.style.cssText = 'flex:1;'
      info.innerHTML = `
        <div style="color:#f5e4b3; font-size:12px; font-weight:700;">${p.name}${isMe?' (you)':''}${!p.alive?' 💀':''}</div>
        <div style="font-size:10px; color:#aaa;">Lv.${p.level}</div>
        <div style="display:flex; align-items:center; gap:4px; margin-top:3px;">
          <span style="font-size:10px; color:#6b8e7f;">HP</span>
          <div style="flex:1; height:6px; background:#2a2420; border-radius:3px; overflow:hidden;">
            <div style="height:100%; background:${p.hp/p.maxHp>0.5?'#6b8e7f':'#c8553d'}; width:${p.hp/p.maxHp*100}%; transition:width 0.3s;"></div>
          </div>
          <span style="font-size:9px; color:#aaa;">${p.hp}/${p.maxHp}</span>
        </div>
        ${p.defending?`<div style="font-size:10px; color:#7fb3c8;">🛡️ 防御中</div>`:''}
      `
      card.appendChild(info)
      partyCol.appendChild(card)
    })
    battleArea.appendChild(partyCol)

    // VS
    const vs = el('div')
    vs.style.cssText = 'color:#c8553d; font-family:"Press Start 2P"; font-size:20px; text-shadow:2px 2px 0 #000;'
    vs.textContent = 'VS'
    battleArea.appendChild(vs)

    // 右: 敵
    const enemyCol = el('div')
    enemyCol.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:8px;'
    enemyCol.id = 'enemyBox'
    const hpPct = s.enemy.hp / s.enemy.maxHp * 100
    enemyCol.innerHTML = `
      <div style="font-size:80px;">${s.enemy.emoji}</div>
      <div style="color:#f5e4b3; font-weight:700; font-size:14px;">${s.enemy.name}</div>
      <div style="color:#aaa; font-size:11px;">Lv.${s.enemy.lv}</div>
      <div style="background:rgba(0,0,0,0.4); border:2px solid #f5e4b3; border-radius:8px; padding:6px; width:180px;">
        <div style="height:10px; background:#2a2420; border-radius:4px; overflow:hidden;">
          <div id="ehpBar" style="height:100%; background:${hpPct>50?'#c8553d':'#8a1a1a'}; width:${hpPct}%; transition:width 0.3s;"></div>
        </div>
        <div style="color:#fff; font-size:10px; text-align:center; margin-top:2px;">${s.enemy.hp} / ${s.enemy.maxHp}</div>
      </div>
    `
    battleArea.appendChild(enemyCol)

    // ── コマンドパネル ──
    renderCommands(myTurn)
  }

  function renderCommands(active: boolean) {
    cmdArea.innerHTML = ''
    if (!active) {
      const wait = el('div')
      wait.style.cssText = 'flex:1; text-align:center; color:#aaa; font-size:14px;'
      wait.textContent = state ? `⏳ ${state.players.find(p=>p.playerId===state!.currentTurnPlayerId)?.name ?? '??'} のターンを待っています...` : '接続中...'
      cmdArea.appendChild(wait)
      return
    }
    const cmds = [
      { cmd:'attack', icon:'⚔️', label:'攻撃', cls:'primary' },
      { cmd:'skill',  icon:'✨', label:'スキル', cls:'' },
      { cmd:'item',   icon:'🍎', label:'回復',  cls:'sage' },
      { cmd:'defend', icon:'🛡️', label:'防御',  cls:'' },
    ]
    cmds.forEach(c => {
      const btn = el('button', `btn ${c.cls}`)
      btn.style.cssText = 'flex:1; padding:20px 8px; font-size:14px; display:flex; flex-direction:column; align-items:center; gap:6px;'
      btn.innerHTML = `<span style="font-size:28px;">${c.icon}</span>${c.label}`
      btn.addEventListener('click', () => {
        if (!myTurn) return
        myTurn = false
        renderCommands(false)
        socket.emit('dungeon:action', { type: c.cmd })
      })
      cmdArea.appendChild(btn)
    })
  }

  // ── Socket イベント ──
  socket.on('connect', () => {
    socket.emit('dungeon:join', {
      playerId: game.playerId,
      name: game.pet.name,
      species: game.pet.species,
      level: game.pet.lv,
    })
    addLog('🔌 ダンジョンに接続しました', 'join')
  })

  socket.on('dungeon:state', (s: DungeonState) => {
    renderState(s)
  })

  socket.on('dungeon:log', ({ message, type }: { message: string; type: string }) => {
    addLog(message, type)
  })

  socket.on('dungeon:action_result', (data: {
    actorId: string; type: string; playerDmg: number;
    enemyHp: number; actorHp: number; log: string;
  }) => {
    addLog(data.log)
    // ダメージエフェクト
    const enemyBox = root.querySelector<HTMLElement>('#enemyBox')
    if (data.playerDmg > 0 && enemyBox) {
      const rect = enemyBox.getBoundingClientRect()
      const rootRect = root.getBoundingClientRect()
      showDmgFloat(rect.left - rootRect.left + 60, rect.top - rootRect.top + 40, data.playerDmg)
      enemyBox.style.animation = 'shake 0.3s'
      setTimeout(() => { if (enemyBox) enemyBox.style.animation = '' }, 300)
    }
    // HP更新（stateが来るまでの即時反映）
    const ehpBar = root.querySelector<HTMLElement>('#ehpBar')
    if (ehpBar && state) {
      const pct = data.enemyHp / state.enemy.maxHp * 100
      ehpBar.style.width = pct + '%'
    }
  })

  socket.on('dungeon:enemy_attack', (data: {
    targetId: string; dmg: number; actorHp: number; alive: boolean; log: string;
  }) => {
    addLog(data.log, data.alive ? 'info' : 'defeat')
    if (data.targetId === game.playerId) {
      showDmgFloat(200, 300, data.dmg, '#fff')
    }
  })

  socket.on('dungeon:victory', ({ floor, reward }: { floor: number; reward: number }) => {
    game.setCoin(game.coin + reward)
    game.setDungeonFloor(floor + 1)
    game.setDungeonWins(game.getDungeonWins() + 1)

    const overlay = el('div')
    overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.65); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:50; gap:14px;'
    overlay.innerHTML = `
      <div style="font-size:52px;">🏆</div>
      <div style="color:#f5e4b3; font-family:'Press Start 2P'; font-size:18px;">勝利！</div>
      <div style="color:#d4a24c; font-size:14px;">パーティ全員に +${reward}G</div>
      <button class="btn primary" id="nextFloorBtn" style="font-size:15px; padding:12px 28px;">次のフロアへ ▶</button>
      <button class="btn" id="retreatAfterBtn" style="font-size:13px;">🏠 自室に戻る</button>
    `
    root.appendChild(overlay)
    overlay.querySelector('#nextFloorBtn')!.addEventListener('click', () => {
      overlay.remove()
      socket.emit('dungeon:next_floor')
    })
    overlay.querySelector('#retreatAfterBtn')!.addEventListener('click', () => {
      socket.emit('dungeon:retreat')
      showScene('room')
    })
  })

  socket.on('dungeon:defeat', () => {
    game.setDungeonFloor(1)
    game.setDungeonWins(0)

    const overlay = el('div')
    overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.75); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:50; gap:14px;'
    overlay.innerHTML = `
      <div style="font-size:52px;">💀</div>
      <div style="color:#c8553d; font-family:'Press Start 2P'; font-size:18px;">全滅…</div>
      <div style="color:#f5e4b3; font-size:13px;">ダンジョン進行度がリセットされました</div>
      <button class="btn" id="goRoomBtn" style="font-size:14px; padding:10px 24px;">🏠 自室に戻る</button>
    `
    root.appendChild(overlay)
    overlay.querySelector('#goRoomBtn')!.addEventListener('click', () => showScene('room'))
  })


  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    socket.disconnect()
  }
}

// ── LOTTERY ────────────────────────────────────────────────────────────────

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
      const info = el('div','',`<div style="font-weight:700; font-size:13px; margin-top:4px;">${esc(p.name)}</div><div style="font-family:'Press Start 2P'; font-size:10px; margin-top:2px;">${p.money.toLocaleString()} G</div>`)
      info.style.textAlign = 'center'
      col.appendChild(info)
      podiumWrap.appendChild(col)
    })

    // List (4位以降)
    const myRank = ranking.findIndex(r => r.id === game.playerId) + 1
    listWrap.innerHTML = rest.map((r, i) =>
      `<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed var(--ink-3); font-size:12px; ${r.id===game.playerId?'background:#f5e4b3;margin:0 -14px;padding:5px 14px;':''}">
        <span><b>#${i+4}</b> &nbsp; ${esc(r.name)}</span>
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

// ── RADIO ROOM ─────────────────────────────────────────────────────────────

export function buildRadio(root: Root, game: GameState) {
  root.style.background = 'linear-gradient(180deg,#2a1e3a 0%,#3a2a4a 60%,#4a3a5a 100%)'

  // 背景SVG（ラウンジ風）
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  svg.setAttribute('viewBox','0 0 1080 600')
  svg.setAttribute('preserveAspectRatio','xMidYMax slice')
  svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;'
  svg.innerHTML = `
    <rect x="0" y="0" width="1080" height="600" fill="#1e1428"/>
    <rect x="0" y="380" width="1080" height="220" fill="#2a1e3a"/>
    <rect x="0" y="460" width="1080" height="140" fill="#352545"/>
    <path d="-20 480 Q 540 450 1100 480" fill="none" stroke="#4a3a5a" stroke-width="40"/>
    <!-- stage lights -->
    <polygon points="100,0 60,200 140,200" fill="rgba(255,220,100,0.08)"/>
    <polygon points="980,0 940,200 1020,200" fill="rgba(255,220,100,0.08)"/>
    <circle cx="100" cy="30" r="18" fill="#ffe066" opacity="0.7"/>
    <circle cx="980" cy="30" r="18" fill="#ffe066" opacity="0.7"/>
    <!-- disco ball -->
    <circle cx="540" cy="60" r="32" fill="none" stroke="#c0c0c0" stroke-width="2"/>
    <circle cx="540" cy="60" r="28" fill="#aaa"/>
    ${Array.from({length:12}).map((_,i)=>{const a=i*30*Math.PI/180;const x=540+28*Math.cos(a);const y=60+28*Math.sin(a);return `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity="0.8"/>`}).join('')}
    <!-- neon sign -->
    <rect x="380" y="100" width="320" height="60" rx="12" fill="none" stroke="#ff66cc" stroke-width="3" filter="url(#neon)"/>
    <text x="540" y="140" text-anchor="middle" fill="#ff66cc" font-size="26" font-weight="bold" font-family="monospace">RADIO LOUNGE</text>
    <!-- sofa left -->
    <rect x="60" y="440" width="160" height="50" rx="10" fill="#7a4a8a" stroke="#2a1428" stroke-width="2"/>
    <rect x="60" y="420" width="24" height="70" rx="8" fill="#8a5a9a" stroke="#2a1428" stroke-width="2"/>
    <rect x="196" y="420" width="24" height="70" rx="8" fill="#8a5a9a" stroke="#2a1428" stroke-width="2"/>
    <!-- sofa right -->
    <rect x="860" y="440" width="160" height="50" rx="10" fill="#7a4a8a" stroke="#2a1428" stroke-width="2"/>
    <rect x="860" y="420" width="24" height="70" rx="8" fill="#8a5a9a" stroke="#2a1428" stroke-width="2"/>
    <rect x="996" y="420" width="24" height="70" rx="8" fill="#8a5a9a" stroke="#2a1428" stroke-width="2"/>
    <!-- center table -->
    <ellipse cx="540" cy="510" rx="80" ry="24" fill="#4a2a5a" stroke="#2a1428" stroke-width="2"/>
    <!-- speaker left -->
    <rect x="140" y="320" width="60" height="100" rx="6" fill="#1a1020" stroke="#3a2a4a" stroke-width="2"/>
    <circle cx="170" cy="350" r="18" fill="#2a2030"/>
    <circle cx="170" cy="390" r="12" fill="#2a2030"/>
    <!-- speaker right -->
    <rect x="880" y="320" width="60" height="100" rx="6" fill="#1a1020" stroke="#3a2a4a" stroke-width="2"/>
    <circle cx="910" cy="350" r="18" fill="#2a2030"/>
    <circle cx="910" cy="390" r="12" fill="#2a2030"/>
    <!-- stars -->
    ${Array.from({length:40}).map((_,i)=>{const x=(i*137)%1080;const y=(i*97)%160;return `<circle cx="${x}" cy="${y}" r="1" fill="#fff" opacity="${0.3+0.5*(i%3)/2}"/>`}).join('')}
  `
  root.appendChild(svg)

  const petLayer = el('div')
  petLayer.style.cssText = 'position:absolute; inset:0 0 92px 0; pointer-events:none;'
  root.appendChild(petLayer)

  const PET_SIZE = 80
  type PeerData = { id: string; name: string; species: string; level: number; x: number; y: number }

  const X_MIN = 0, X_MAX = 1080
  const Y_MIN = 20, Y_MAX = 580

  type WanderState = { x:number; y:number; targetX:number; targetY:number; speed:number; idleUntil:number; facing:number; phase:number }

  function randTarget() { return { tx: X_MIN+Math.random()*(X_MAX-X_MIN), ty: Y_MIN+Math.random()*(Y_MAX-Y_MIN) } }
  function newWanderState(startX?: number): WanderState {
    const x = startX ?? (X_MIN+Math.random()*(X_MAX-X_MIN))
    const y = Y_MIN+Math.random()*(Y_MAX-Y_MIN)
    const { tx, ty } = randTarget()
    return { x, y, targetX:tx, targetY:ty, speed:0.5+Math.random()*0.7, idleUntil:0, facing:1, phase:Math.random()*Math.PI*2 }
  }
  function stepWander(w: WanderState, now: number): number {
    if (now < w.idleUntil) return 0
    const dx = w.targetX-w.x; const dy = w.targetY-w.y
    const dist = Math.sqrt(dx*dx+dy*dy)
    if (dist < 3) {
      if (Math.random() < 0.3) { w.idleUntil = now+800+Math.random()*2500; return 0 }
      const t = randTarget(); w.targetX=t.tx; w.targetY=t.ty; w.speed=0.4+Math.random()*0.8
    } else {
      w.x += (dx/dist)*w.speed; w.y += (dy/dist)*w.speed*0.5; w.facing = dx>0?1:-1
    }
    return Math.abs(Math.sin((now+w.phase*300)/280))*5
  }

  const peers = new Map<string, { data: PeerData; wrapper: HTMLElement; wander: WanderState }>()
  function stageFromLevel(lv: number) { return lv>=50?3:lv>=20?2:1 }

  function makePetWrapper(data: PeerData, isYou: boolean): HTMLElement {
    const w = el('div')
    w.style.cssText = `position:absolute; width:${PET_SIZE}px; display:flex; flex-direction:column; align-items:center; pointer-events:auto; cursor:pointer; user-select:none;`
    w.appendChild(createPetCanvas(data.species as Species, stageFromLevel(data.level), PET_SIZE))
    const lbl = el('div')
    lbl.style.cssText = `background:${isYou?'var(--accent)':'#4a2a5a'}; color:#fff; border:1.5px solid var(--ink); border-radius:8px; padding:1px 8px; font-size:11px; font-weight:700; white-space:nowrap; margin-top:2px;`
    lbl.textContent = data.name+(isYou?' (you)':'')
    w.appendChild(lbl)
    w.addEventListener('mouseenter', () => {
      if (w.querySelector('.radio-status')) return
      const bub = el('div','radio-status')
      bub.style.cssText = `position:absolute; bottom:${PET_SIZE+30}px; left:50%; transform:translateX(-50%); background:#2a1428; color:#fff; border:2px solid var(--ink); border-radius:10px; padding:6px 12px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap; z-index:20; pointer-events:none;`
      bub.innerHTML = `<b>${esc(data.name)}</b><br>Lv.${Number(data.level)} · ${esc(String(data.species))}`
      w.appendChild(bub)
    })
    w.addEventListener('mouseleave', () => w.querySelector('.radio-status')?.remove())
    return w
  }

  function showChatBubble(wrapper: HTMLElement, message: string) {
    let container = wrapper.querySelector<HTMLElement>('.chat-container')
    if (!container) {
      container = el('div', 'chat-container')
      container.style.cssText = `position:absolute; bottom:${PET_SIZE+30}px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:3px; pointer-events:none; z-index:10;`
      wrapper.insertBefore(container, wrapper.firstChild)
    }
    while (container.children.length >= 3) container.firstElementChild!.remove()
    const bub = el('div', 'chat-bub')
    bub.style.cssText = `background:#fff; border:2px solid var(--ink); border-radius:10px; padding:5px 10px; font-size:12px; box-shadow:2px 2px 0 var(--ink); white-space:nowrap;`
    bub.textContent = message
    container.appendChild(bub)
    setTimeout(() => { bub.remove(); if (container && container.children.length === 0) container.remove() }, 5000)
  }

  function setPetPos(wrapper: HTMLElement, x: number, y: number, bob: number) {
    wrapper.style.left = (x-PET_SIZE/2)+'px'
    wrapper.style.top  = (y-PET_SIZE-bob)+'px'
  }

  const youWander = newWanderState()
  const currentPet = game.pet
  const youData: PeerData = { id:game.playerId, name:currentPet.name, species:currentPet.species, level:currentPet.lv, x:youWander.x, y:420 }
  const youWrapper = makePetWrapper(youData, true)
  petLayer.appendChild(youWrapper)

  // ── Socket ──
  const BASE_URL = (import.meta as { env: Record<string,string> }).env.VITE_API_URL ?? ''
  const socket = io(BASE_URL+'/radio', { transports:['websocket','polling'], auth: { playerId: game.playerId } })
  let currentStationIdx = bgm.radioStation
  const audio = new Audio()
  audio.volume = bgm.volume
  audio.muted = bgm.muted

  function loadStation(idx: number, save = true) {
    currentStationIdx = idx
    const track = RADIO_TRACKS[idx]
    if (!track) { audio.pause(); updateRadioUI(); return }
    audio.src = track.src
    audio.loop = true
    audio.play().catch(() => {})
    if (save) bgm.setRadioStation(idx)
    updateRadioUI()
  }

  function updateRadioUI() {
    const track = RADIO_TRACKS[currentStationIdx]
    const nameEl = root.querySelector<HTMLElement>('#radioTrackName')
    if (nameEl) nameEl.textContent = track ? track.label : '(トラックなし)'
    const sel = root.querySelector<HTMLSelectElement>('#radioTrackSelect')
    if (sel) sel.value = String(currentStationIdx)
    const countEl = root.querySelector<HTMLElement>('#radioCount')
    if (countEl) countEl.textContent = `● ${peers.size+1} 人がリスニング中`
  }

  socket.on('connect', () => {
    socket.emit('join', { id:game.playerId, name:currentPet.name, species:currentPet.species, level:currentPet.lv })
  })

  // サーバーから同期された局を受け取る（入室時は自分のDB保存値を優先）
  let firstStation = true
  socket.on('station', ({ index }: { index: number }) => {
    if (firstStation) {
      // 入室時は自分のDB保存局を使い、サーバーに通知
      firstStation = false
      loadStation(currentStationIdx, false)
      socket.emit('change_station', { index: currentStationIdx })
    } else if (index !== currentStationIdx) {
      loadStation(index, false)
    }
  })

  socket.on('players', (players: PeerData[]) => {
    players.forEach(p => {
      if (p.id === game.playerId) return
      const w = makePetWrapper(p, false)
      petLayer.appendChild(w)
      peers.set(p.id, { data:p, wrapper:w, wander:newWanderState(p.x) })
    })
    updateRadioUI()
  })

  socket.on('player:join', (p: PeerData) => {
    if (p.id === game.playerId || peers.has(p.id)) return
    const w = makePetWrapper(p, false)
    petLayer.appendChild(w)
    peers.set(p.id, { data:p, wrapper:w, wander:newWanderState(p.x) })
    updateRadioUI()
  })

  socket.on('player:leave', ({ id }: { id: string }) => {
    const peer = peers.get(id)
    if (peer) { peer.wrapper.querySelectorAll('canvas').forEach((c: Element) => (c as HTMLCanvasElement & { destroy?: () => void }).destroy?.()); peer.wrapper.remove() }
    peers.delete(id)
    updateRadioUI()
  })

  socket.on('player:move', ({ id, x }: { id: string; x: number; y: number }) => {
    const peer = peers.get(id)
    if (peer) peer.wander.targetX = x
  })

  socket.on('radio:chat', ({ id, message }: { id: string; message: string }) => {
    if (id === game.playerId) return
    const peer = Array.from(peers.values()).find(p => p.data.id === id)
    if (peer) showChatBubble(peer.wrapper, message)
  })

  function setFacing(wrapper: HTMLElement, dir: number) {
    const canvas = wrapper.querySelector('canvas')
    if (canvas) canvas.style.transform = dir<0?'scaleX(-1)':'scaleX(1)'
  }

  // ── ラジオの床エサシステム ──
  type RadioFloorFood = { foodItemId: string; emoji: string; x: number; y: number; el: HTMLElement; cleanup: () => void }
  const floorFoodsR: RadioFloorFood[] = []

  function placeRadioFood(foodItemId: string, emoji: string) {
    const x = X_MIN + Math.random() * (X_MAX - X_MIN)
    const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN)
    const foodEl = el('div')
    foodEl.style.cssText = `position:absolute; left:${x-18}px; top:${y-18}px; font-size:30px; cursor:grab; user-select:none; pointer-events:auto; filter:drop-shadow(2px 2px 0 rgba(0,0,0,0.5)); z-index:5;`
    foodEl.textContent = emoji
    const entry: RadioFloorFood = { foodItemId, emoji, x, y, el: foodEl, cleanup: () => {} }
    let dragging = false, dragOffX = 0, dragOffY = 0
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      const rect = petLayer.getBoundingClientRect()
      entry.x = Math.max(X_MIN, Math.min(X_MAX, (e.clientX - rect.left) - dragOffX))
      entry.y = Math.max(Y_MIN, Math.min(Y_MAX, (e.clientY - rect.top) - dragOffY))
      foodEl.style.left = (entry.x - 18) + 'px'
      foodEl.style.top  = (entry.y - 18) + 'px'
    }
    const onUp = () => { if (dragging) { dragging = false; foodEl.style.cursor = 'grab' } }
    foodEl.addEventListener('mousedown', (e) => {
      dragging = true; foodEl.style.cursor = 'grabbing'; e.preventDefault()
      const rect = petLayer.getBoundingClientRect()
      dragOffX = (e.clientX - rect.left) - entry.x
      dragOffY = (e.clientY - rect.top) - entry.y
    })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    entry.cleanup = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    petLayer.appendChild(foodEl)
    floorFoodsR.push(entry)
  }

  function eatRadioFood(entry: RadioFloorFood, eaterName: string, isYou: boolean) {
    const idx = floorFoodsR.indexOf(entry)
    if (idx === -1) return
    floorFoodsR.splice(idx, 1)
    entry.el.style.transition = 'transform 0.2s, opacity 0.2s'
    entry.el.style.transform = 'scale(0)'
    entry.el.style.opacity = '0'
    setTimeout(() => entry.el.remove(), 220)
    entry.cleanup()
    if (isYou) {
      usePlayerStore.getState().useFood(entry.foodItemId)
      game.toast(`${entry.emoji} もぐもぐ！ おいしい！`)
    } else {
      game.toast(`${entry.emoji} ${eaterName}が食べた！`)
    }
  }

  let rafId = 0, lastMoveEmit = 0
  function tick() {
    const now = performance.now()

    const isYouHungry = game.pet.hun < 1.0
    let youBob = 0
    if (isYouHungry && floorFoodsR.length > 0) {
      const nearest = floorFoodsR.reduce((a, b) => {
        const da = (a.x-youWander.x)**2+(a.y-youWander.y)**2
        const db = (b.x-youWander.x)**2+(b.y-youWander.y)**2
        return da < db ? a : b
      })
      const dx = nearest.x - youWander.x, dy = nearest.y - youWander.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < 25) {
        eatRadioFood(nearest, '', true)
      } else {
        youWander.x += (dx/dist) * 1.5
        youWander.y += (dy/dist) * 0.75
        youWander.facing = dx > 0 ? 1 : -1
      }
      youBob = Math.abs(Math.sin(now/280)) * 5
    } else {
      youBob = stepWander(youWander, now)
    }
    setFacing(youWrapper, youWander.facing)
    setPetPos(youWrapper, youWander.x, youWander.y, youBob)

    peers.forEach(peer => {
      let bob = 0
      if (floorFoodsR.length > 0) {
        const nearest = floorFoodsR.reduce((a, b) => {
          const da = (a.x-peer.wander.x)**2+(a.y-peer.wander.y)**2
          const db = (b.x-peer.wander.x)**2+(b.y-peer.wander.y)**2
          return da < db ? a : b
        })
        const dx = nearest.x - peer.wander.x, dy = nearest.y - peer.wander.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 25) {
          eatRadioFood(nearest, peer.data.name, false)
        } else {
          peer.wander.x += (dx/dist) * 1.5
          peer.wander.y += (dy/dist) * 0.75
          peer.wander.facing = dx > 0 ? 1 : -1
        }
        bob = Math.abs(Math.sin(now/280)) * 5
      } else {
        bob = stepWander(peer.wander, now)
      }
      setFacing(peer.wrapper, peer.wander.facing)
      setPetPos(peer.wrapper, peer.wander.x, peer.wander.y, bob)
    })

    if (now-lastMoveEmit > 150) {
      socket.emit('move', { x:Math.round(youWander.x), y:youWander.y })
      lastMoveEmit = now
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  // ── ラジオUIパネル ──
  const radioPanel = el('div')
  radioPanel.style.cssText = `position:absolute; top:12px; right:16px; width:260px; background:#1a0e28; border:2px solid #8844aa; border-radius:14px; box-shadow:0 0 16px #8844aa44; padding:12px 14px; z-index:10; color:#fff;`
  const trackOptions = RADIO_TRACKS.length > 0
    ? RADIO_TRACKS.map((t, i) => `<option value="${i}">${esc(t.label)}</option>`).join('')
    : `<option value="-1">(public/radio/ にMP3を置いてください)</option>`
  radioPanel.innerHTML = `
    <div style="font-size:13px; font-weight:700; margin-bottom:8px; color:#ff88cc;">🎵 ラジオルーム</div>
    <div id="radioTrackName" style="font-size:11px; margin-bottom:8px; color:#ffccee; min-height:16px; word-break:break-all;"></div>
    <select id="radioTrackSelect" style="width:100%; background:#2a1428; color:#fff; border:1.5px solid #8844aa; border-radius:8px; padding:5px 8px; font-size:12px; margin-bottom:10px;">
      ${trackOptions}
    </select>
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <button id="radioPrev" style="background:#2a1428; border:1.5px solid #8844aa; color:#ccc; border-radius:8px; padding:4px 10px; cursor:pointer; font-size:14px;">⏮</button>
      <button id="radioPlayPause" style="background:#8844aa; border:none; color:#fff; border-radius:8px; padding:4px 14px; cursor:pointer; font-size:14px;">▶</button>
      <button id="radioNext" style="background:#2a1428; border:1.5px solid #8844aa; color:#ccc; border-radius:8px; padding:4px 10px; cursor:pointer; font-size:14px;">⏭</button>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:11px; color:#aaa;">音量</span>
      <input id="radioVol" type="range" min="0" max="1" step="0.05" value="${bgm.volume}" style="flex:1; accent-color:#ff88cc;" />
      <button id="radioMute" style="background:none; border:none; color:#ccc; cursor:pointer; font-size:16px;" title="ミュート">${bgm.muted ? '🔇' : '🔊'}</button>
    </div>
    <div id="radioCount" style="margin-top:8px; font-size:11px; color:#aaa;">● 1 人がリスニング中</div>
  `
  root.appendChild(radioPanel)

  const trackSelect = radioPanel.querySelector<HTMLSelectElement>('#radioTrackSelect')!
  trackSelect.addEventListener('change', () => {
    const idx = parseInt(trackSelect.value)
    if (idx >= 0) { socket.emit('change_station', { index: idx }); loadStation(idx) }
  })

  const prevBtn = radioPanel.querySelector<HTMLElement>('#radioPrev')!
  prevBtn.addEventListener('click', () => {
    const idx = (currentStationIdx - 1 + RADIO_TRACKS.length) % RADIO_TRACKS.length
    socket.emit('change_station', { index: idx }); loadStation(idx)
  })

  const nextBtn = radioPanel.querySelector<HTMLElement>('#radioNext')!
  nextBtn.addEventListener('click', () => {
    const idx = (currentStationIdx + 1) % RADIO_TRACKS.length
    socket.emit('change_station', { index: idx }); loadStation(idx)
  })

  const playPauseBtn = radioPanel.querySelector<HTMLElement>('#radioPlayPause')!
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().catch(() => {}); playPauseBtn.textContent = '⏸' }
    else { audio.pause(); playPauseBtn.textContent = '▶' }
  })
  audio.addEventListener('play', () => { playPauseBtn.textContent = '⏸' })
  audio.addEventListener('pause', () => { playPauseBtn.textContent = '▶' })

  const volSlider = radioPanel.querySelector<HTMLInputElement>('#radioVol')!
  volSlider.addEventListener('input', () => {
    const v = parseFloat(volSlider.value)
    audio.volume = v
    bgm.setVolume(v)
  })

  const muteBtn = radioPanel.querySelector<HTMLElement>('#radioMute')!
  muteBtn.addEventListener('click', () => {
    const m = bgm.toggleMute()
    audio.muted = m
    muteBtn.textContent = m ? '🔇' : '🔊'
  })

  // ── チャットドック ──
  const chatDock = el('div')
  chatDock.style.cssText = `position:absolute; left:16px; right:16px; bottom:16px; height:60px; background:#1a0e28; border:2px solid #8844aa; border-radius:14px; box-shadow:4px 4px 0 var(--ink); padding:0 14px; z-index:10; display:flex; align-items:center; gap:10px;`
  chatDock.innerHTML = `
    <span style="font-weight:700; font-size:13px; color:#ff88cc;">💬 チャット</span>
    <input id="chatInput" type="text" maxlength="60" placeholder="メッセージを入力…" style="flex:1; padding:8px 12px; border:2px solid #8844aa; border-radius:8px; font-family:inherit; font-size:13px; background:#2a1428; color:#fff;" />
    <button class="btn primary" id="chatSend">送信</button>
    <button class="btn" id="radioFeedBtn">🍎 エサ</button>
  `
  root.appendChild(chatDock)

  const chatInput = chatDock.querySelector<HTMLInputElement>('#chatInput')!
  function sendChat() {
    const msg = chatInput.value.trim()
    if (!msg) return
    socket.emit('chat', msg)
    showChatBubble(youWrapper, msg)
    chatInput.value = ''
  }
  chatInput.addEventListener('keydown', e => { e.stopPropagation(); if (e.key==='Enter') sendChat() })
  chatDock.querySelector('#chatSend')!.addEventListener('click', sendChat)
  chatDock.querySelector<HTMLElement>('#radioFeedBtn')!.addEventListener('click', () => {
    openFoodMenuModal(root, game, (foodItemId, emoji) => { placeRadioFood(foodItemId, emoji) })
  })

  addBoardObject(root, 'radio', game.playerId)

  ;(root as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    socket.disconnect()
    cancelAnimationFrame(rafId)
    audio.pause()
    audio.src = ''
    floorFoodsR.forEach(f => f.cleanup())
  }
}

export function buildLottery(root: Root, game: GameState) {
  root.style.background = 'linear-gradient(180deg,#f7e1c0 0%,#e8c89a 100%)'

  const hdr = el('div')
  hdr.style.cssText = `position:absolute; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:center; z-index:4;`
  hdr.innerHTML = `
    <div style="font-size:18px; font-weight:700;">🎰 宝くじ店「幸運堂」</div>
    <div style="font-size:12px; color:var(--ink-2);">今日の運勢: <b style="color:var(--accent)">★★★☆☆</b></div>
  `
  root.appendChild(hdr)

  const grid = el('div')
  grid.style.cssText = `position:absolute; top:64px; left:16px; right:16px; bottom:16px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;`
  root.appendChild(grid)

  // ── ガラポン ──
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

  // ── スクラッチ ──
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

  // ── スロット ──
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

  function syncCoin() {
    const { usePlayerStore: ps } = { usePlayerStore }
    game.coin = ps.getState().money
  }

  pA.querySelector<HTMLElement>('[data-act="garapon"]')!.addEventListener('click', async () => {
    if (game.coin < 100) { game.toast('コイン不足'); return }
    const drum = pA.querySelector<HTMLElement>('.drum')!
    drum.style.transform = `rotate(${720+Math.random()*360}deg)`
    const res = await playLottery(game.playerId, 'garapon')
    setTimeout(() => { drum.style.transform = 'rotate(0deg)' }, 1500)
    if ('error' in res) { game.toast(res.error); return }
    const r = (res as { result: { label: string; prize: number } }).result
    game.toast(`${r.label}${r.prize ? ' +'+r.prize+'G' : ''}`)
    game.setCoin(usePlayerStore.getState().money - 100 + r.prize)
    syncCoin()
  })

  pA.querySelector<HTMLElement>('[data-act="garapon10"]')!.addEventListener('click', async () => {
    if (game.coin < 1000) { game.toast('コイン不足'); return }
    const res = await playLottery(game.playerId, 'garapon10')
    if ('error' in res) { game.toast(res.error); return }
    const r = (res as { result: { totalPrize: number } }).result
    game.toast(`🎁 10連結果: +${r.totalPrize}G`)
    game.setCoin(usePlayerStore.getState().money - 1000 + r.totalPrize)
    syncCoin()
  })

  pB.querySelector<HTMLElement>('[data-act="scratch"]')!.addEventListener('click', async () => {
    if (game.coin < 100) { game.toast('コイン不足'); return }
    const res = await playLottery(game.playerId, 'scratch')
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
    const slotSymbols = ['💎','🪙','⭐','🔔','🍀','🐉']
    const res = await playLottery(game.playerId, 'slot')
    if ('error' in res) { game.toast(res.error); spinBtn.disabled = false; return }
    const r = (res as { result: { reels: string[]; prize: number } }).result
    reels.forEach((reel, i) => {
      let n = 0; const steps = 20 + i * 10
      const tick = setInterval(() => {
        reel.textContent = slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; n++
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
