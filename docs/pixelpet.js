/* ==============================================================
   Pixel Pet Renderer
   Draws 32×32 sprites onto a canvas at arbitrary scale
   Species × Stage combinations (simple procedural placeholders)
   ============================================================== */

const PAL = {
  dragon: { body:'#c8553d', light:'#e8836b', dark:'#7a2a1a', belly:'#f5e4b3', eye:'#2a2420', white:'#fff' },
  unicorn:{ body:'#f0d5e0', light:'#ffffff', dark:'#b88aa0', belly:'#fff8fb', eye:'#2a2420', horn:'#d4a24c', mane:'#7a6cab', white:'#fff' },
  slime:  { body:'#6bbf7a', light:'#a6e0b2', dark:'#2e6b3a', belly:'#c4f0cf', eye:'#2a2420', white:'#fff' },
  phoenix:{ body:'#d4a24c', light:'#f0cf7a', dark:'#8a5a1a', belly:'#f5e4b3', eye:'#2a2420', beak:'#c8553d', white:'#fff' },
  golem:  { body:'#8a8578', light:'#b5b0a0', dark:'#4a463c', belly:'#d0cab8', eye:'#e8c670', crystal:'#7a6cab', white:'#fff' },
};

/* We build sprites from a tiny compressed grid.
   '.' = transparent
   'b','l','d' = body/light/dark
   'y' = belly
   'e' = eye, 'w' = white
   'h' = horn (unicorn), 'm' = mane (unicorn), 'k' = beak (phoenix), 'c' = crystal (golem)
*/

function tinyDragon(stage) {
  // 32x32
  const S = Array.from({length:32},()=>'.'.repeat(32).split(''));
  const put = (x,y,v)=>{ if(y>=0&&y<32&&x>=0&&x<32) S[y][x]=v; };

  if (stage===1) { // ちびドラゴン: round body, small horns
    // body blob
    for (let y=10;y<26;y++){
      for (let x=8;x<24;x++){
        const dx=x-16, dy=y-18, r=Math.sqrt(dx*dx+dy*dy*1.2);
        if (r<7.5) put(x,y,'b');
      }
    }
    // outline + shading
    for (let y=10;y<26;y++){
      for (let x=8;x<24;x++){
        if (S[y][x]!=='b') continue;
        const n = ['.','l','d'];
        if (S[y-1]?.[x]==='.') put(x,y-1,'d'); // top shade outline handled later
      }
    }
    // belly
    for (let y=18;y<24;y++){
      for (let x=13;x<19;x++){
        if (S[y][x]==='b') put(x,y,'y');
      }
    }
    // horns (small)
    put(12,9,'d'); put(13,9,'d'); put(12,10,'b');
    put(19,9,'d'); put(20,9,'d'); put(20,10,'b');
    // wings tiny
    put(6,14,'d'); put(7,14,'b'); put(7,15,'b'); put(6,15,'d');
    put(25,14,'d'); put(24,14,'b'); put(24,15,'b'); put(25,15,'d');
    // eyes + highlight
    put(12,15,'e'); put(13,15,'w'); put(19,15,'e'); put(20,15,'w');
    // cheeks
    put(11,18,'l'); put(21,18,'l');
    // mouth
    put(15,19,'e'); put(16,19,'e');
    // feet
    put(11,25,'d'); put(12,25,'b'); put(19,25,'b'); put(20,25,'d');
    // light shading on top
    for (let x=10;x<22;x++) if (S[12][x]==='b') put(x,12,'l');
  } else if (stage===2) { // ドラゴン（通常）: longer body, neck
    // main body
    for (let y=13;y<24;y++){
      for (let x=6;x<22;x++){
        const dx=x-14, dy=y-18, r=Math.sqrt(dx*dx*1.1+dy*dy*1.4);
        if (r<6.5) put(x,y,'b');
      }
    }
    // neck + head
    for (let y=6;y<14;y++){
      for (let x=16;x<24;x++){
        const dx=x-20, dy=y-10, r=Math.sqrt(dx*dx+dy*dy);
        if (r<4) put(x,y,'b');
      }
    }
    // wing (big)
    for (let y=8;y<18;y++){
      for (let x=1;x<12;x++){
        const dx=x-11, dy=y-13;
        if (dx*dx*0.6 + dy*dy < 24 && dx<=0) put(x,y,'d');
      }
    }
    for (let y=9;y<17;y++){
      for (let x=3;x<11;x++){
        if (S[y][x]==='d') put(x,y,'b');
      }
    }
    // belly
    for (let y=16;y<23;y++) for (let x=10;x<17;x++) if (S[y][x]==='b') put(x,y,'y');
    // horns
    put(18,3,'d'); put(19,3,'d'); put(19,4,'b');
    put(22,3,'d'); put(23,3,'d'); put(22,4,'b');
    // eye
    put(20,9,'e'); put(21,9,'w');
    // mouth
    put(22,11,'e'); put(23,11,'e');
    // tail
    put(5,22,'b'); put(4,23,'b'); put(3,23,'d'); put(3,24,'d');
    // feet
    put(9,24,'d'); put(13,24,'d'); put(17,24,'d');
    // highlight
    for (let y=13;y<16;y++) for (let x=8;x<20;x++) if (S[y][x]==='b') put(x,y,'l');
  } else { // stage 3 古龍
    // giant serpentine
    // body curve
    for (let y=10;y<28;y++){
      for (let x=4;x<28;x++){
        const cx = 16 + Math.sin((y-10)*0.5)*6;
        const dx = x-cx;
        if (Math.abs(dx) < 4.5) put(x,y,'b');
      }
    }
    // head
    for (let y=3;y<12;y++){
      for (let x=10;x<22;x++){
        const dx=x-16, dy=y-7, r=Math.sqrt(dx*dx*1.1+dy*dy*1.3);
        if (r<5) put(x,y,'b');
      }
    }
    // big horns
    for (let i=0;i<5;i++) { put(11+i,2-Math.min(i,2),'d'); put(20+(4-i),2-Math.min(4-i,2),'d'); }
    // wings huge
    for (let y=6;y<18;y++){
      for (let x=0;x<8;x++){
        const dx=x-7, dy=y-12;
        if (dx*dx*0.7 + dy*dy < 40 && dx<=0) put(x,y,'d');
      }
      for (let x=24;x<32;x++){
        const dx=x-24, dy=y-12;
        if (dx*dx*0.7 + dy*dy < 40 && dx>=0) put(x,y,'d');
      }
    }
    // wing body
    for (let y=7;y<16;y++){
      for (let x=2;x<7;x++) if (S[y][x]==='d') put(x,y,'b');
      for (let x=25;x<30;x++) if (S[y][x]==='d') put(x,y,'b');
    }
    // belly
    for (let y=12;y<26;y++) for (let x=13;x<19;x++) if (S[y][x]==='b') put(x,y,'y');
    // eyes glowing
    put(12,7,'e'); put(13,7,'w'); put(18,7,'e'); put(19,7,'w');
    put(12,6,'l'); put(19,6,'l');
    // mouth fangs
    put(14,10,'w'); put(17,10,'w');
    // highlights
    for (let x=0;x<32;x++) if (S[11][x]==='b') put(x,11,'l');
  }

  return S;
}

function tinyUnicorn(stage) {
  const S = Array.from({length:32},()=>'.'.repeat(32).split(''));
  const put=(x,y,v)=>{ if(y>=0&&y<32&&x>=0&&x<32) S[y][x]=v; };

  if (stage===1) { // こうまちゃん
    // round body
    for (let y=12;y<24;y++){
      for (let x=9;x<23;x++){
        const dx=x-16, dy=y-18;
        if (dx*dx + dy*dy*1.3 < 40) put(x,y,'b');
      }
    }
    // mane
    for (let y=10;y<18;y++){ put(11,y,'m'); put(12,y,'m'); }
    put(10,12,'m'); put(13,11,'m');
    // horn
    put(13,9,'h'); put(14,8,'h'); put(14,10,'h');
    // belly
    for (let y=18;y<22;y++) for (let x=13;x<19;x++) if (S[y][x]==='b') put(x,y,'y');
    // eye
    put(18,14,'e'); put(19,14,'w');
    // cheek
    put(20,17,'l');
    // legs
    put(12,24,'d'); put(14,24,'d'); put(17,24,'d'); put(19,24,'d');
  } else if (stage===2) {
    // body
    for (let y=11;y<22;y++){
      for (let x=5;x<24;x++){
        const dx=x-13, dy=y-16;
        if (dx*dx*0.8 + dy*dy*1.4 < 36) put(x,y,'b');
      }
    }
    // head (upper right)
    for (let y=5;y<14;y++){
      for (let x=18;x<28;x++){
        const dx=x-22, dy=y-9;
        if (dx*dx + dy*dy < 16) put(x,y,'b');
      }
    }
    // horn
    put(23,1,'h'); put(23,2,'h'); put(24,3,'h'); put(23,4,'h');
    // mane
    for (let y=6;y<16;y++) { put(19,y,'m'); put(20,y,'m'); }
    // eye
    put(24,8,'e'); put(25,8,'w');
    // tail
    for (let y=10;y<20;y++) { put(3,y,'m'); put(4,y,'m'); }
    // belly
    for (let y=15;y<21;y++) for (let x=10;x<18;x++) if (S[y][x]==='b') put(x,y,'y');
    // legs
    put(8,22,'d'); put(11,22,'d'); put(15,22,'d'); put(18,22,'d');
    put(8,23,'d'); put(11,23,'d'); put(15,23,'d'); put(18,23,'d');
    // highlight
    for (let x=7;x<22;x++) if (S[12][x]==='b') put(x,12,'l');
  } else {
    // 天馬 (winged, majestic)
    // body
    for (let y=14;y<24;y++){
      for (let x=7;x<22;x++){
        const dx=x-14, dy=y-19;
        if (dx*dx*0.8 + dy*dy*1.3 < 28) put(x,y,'b');
      }
    }
    // head
    for (let y=8;y<16;y++){
      for (let x=17;x<26;x++){
        const dx=x-21, dy=y-12;
        if (dx*dx + dy*dy < 14) put(x,y,'b');
      }
    }
    // horn big spiral
    put(22,4,'h'); put(21,5,'h'); put(22,5,'h'); put(22,6,'h'); put(21,7,'h'); put(22,7,'h');
    // wings spread
    for (let y=6;y<16;y++){
      for (let x=0;x<10;x++){
        const dx=x-9, dy=y-11;
        if (dx*dx*0.7 + dy*dy < 30 && dx<=0) put(x,y,'l');
      }
    }
    for (let y=7;y<15;y++) for (let x=2;x<9;x++) if (S[y][x]==='l') put(x,y,'w');
    // mane
    for (let y=8;y<18;y++) { put(17,y,'m'); put(18,y,'m'); }
    put(16,10,'m');
    // tail flowing
    for (let y=15;y<24;y++) { put(5,y,'m'); put(6,y,'m'); }
    // eye
    put(22,12,'e'); put(23,12,'w');
    // legs
    put(9,24,'d'); put(12,24,'d'); put(16,24,'d'); put(19,24,'d');
    // highlight
    for (let x=9;x<21;x++) if (S[15][x]==='b') put(x,15,'l');
  }
  return S;
}

function tinySlime(stage){
  const S=Array.from({length:32},()=>'.'.repeat(32).split(''));
  const put=(x,y,v)=>{ if(y>=0&&y<32&&x>=0&&x<32) S[y][x]=v; };
  if (stage===1){
    for (let y=14;y<26;y++){
      for (let x=10;x<22;x++){
        const dx=x-16, dy=y-22;
        if (dx*dx + dy*dy*2 < 42) put(x,y,'b');
      }
    }
    // shine
    put(13,16,'w'); put(14,16,'w'); put(13,17,'l');
    // eyes
    put(14,20,'e'); put(18,20,'e');
    put(14,19,'w'); put(18,19,'w');
    // smile
    put(15,22,'e'); put(16,22,'e'); put(17,22,'e');
    // belly
    for (let y=22;y<25;y++) for (let x=13;x<20;x++) if (S[y][x]==='b') put(x,y,'y');
  } else if (stage===2){
    for (let y=12;y<27;y++){
      for (let x=7;x<25;x++){
        const dx=x-16, dy=y-22;
        if (dx*dx*0.9 + dy*dy*1.8 < 80) put(x,y,'b');
      }
    }
    put(11,15,'w'); put(12,15,'w'); put(11,16,'l'); put(12,16,'l');
    put(13,19,'e'); put(18,19,'e');
    put(13,18,'w'); put(18,18,'w');
    // big smile
    for (let x=13;x<20;x++) put(x,22,'e');
    put(13,21,'e'); put(19,21,'e');
    // drop particles
    put(8,26,'b'); put(24,26,'b');
  } else {
    // キングスライム - crown
    for (let y=8;y<28;y++){
      for (let x=4;x<28;x++){
        const dx=x-16, dy=y-22;
        if (dx*dx*0.85 + dy*dy*1.6 < 140) put(x,y,'b');
      }
    }
    // crown
    put(12,4,'h'); put(13,3,'h'); put(14,4,'h'); put(15,3,'h'); put(16,2,'h'); put(17,3,'h'); put(18,4,'h'); put(19,3,'h'); put(20,4,'h');
    put(12,5,'h'); put(13,5,'h'); put(14,5,'h'); put(15,5,'h'); put(16,5,'h'); put(17,5,'h'); put(18,5,'h'); put(19,5,'h'); put(20,5,'h');
    put(16,6,'d');
    put(13,6,'d'); put(19,6,'d');
    // big eyes (king)
    put(11,14,'e'); put(12,14,'e'); put(20,14,'e'); put(21,14,'e');
    put(12,13,'w'); put(21,13,'w');
    // royal smile
    for (let x=13;x<20;x++) put(x,18,'e');
    put(12,17,'e'); put(20,17,'e');
    // shine
    put(9,11,'w'); put(10,11,'w');
  }
  return S;
}

function tinyPhoenix(stage){
  const S=Array.from({length:32},()=>'.'.repeat(32).split(''));
  const put=(x,y,v)=>{ if(y>=0&&y<32&&x>=0&&x<32) S[y][x]=v; };
  if (stage===1){
    // chick: round
    for (let y=10;y<24;y++){
      for (let x=10;x<22;x++){
        const dx=x-16, dy=y-17;
        if (dx*dx + dy*dy*1.3 < 30) put(x,y,'b');
      }
    }
    put(13,14,'e'); put(18,14,'e');
    put(14,13,'w'); put(19,13,'w');
    put(15,16,'k'); put(16,16,'k'); // beak
    // feet
    put(13,23,'k'); put(14,23,'k'); put(18,23,'k'); put(19,23,'k');
    // tuft
    put(16,9,'d'); put(15,9,'d');
    // cheeks
    put(11,16,'l'); put(21,16,'l');
    // highlight
    for (let x=11;x<21;x++) if (S[11][x]==='b') put(x,11,'l');
  } else if (stage===2){
    // phoenix full
    for (let y=11;y<22;y++){
      for (let x=10;x<23;x++){
        const dx=x-16, dy=y-16;
        if (dx*dx + dy*dy*1.3 < 26) put(x,y,'b');
      }
    }
    // wings spread up
    for (let y=5;y<16;y++){
      for (let x=2;x<12;x++){ const dx=x-11, dy=y-10; if (dx*dx*0.6+dy*dy<30 && dx<=0) put(x,y,'d'); }
      for (let x=20;x<30;x++){ const dx=x-20, dy=y-10; if (dx*dx*0.6+dy*dy<30 && dx>=0) put(x,y,'d'); }
    }
    // wing inner (accent)
    for (let y=7;y<15;y++){
      for (let x=4;x<11;x++) if (S[y][x]==='d') put(x,y,'l');
      for (let x=21;x<28;x++) if (S[y][x]==='d') put(x,y,'l');
    }
    // tail feathers
    put(15,23,'d'); put(16,24,'d'); put(17,23,'d'); put(16,25,'l');
    // beak
    put(15,17,'k'); put(16,17,'k');
    // eyes
    put(13,14,'e'); put(18,14,'e');
    put(14,13,'w'); put(19,13,'w');
    // crest
    put(15,9,'l'); put(16,8,'l'); put(17,9,'l');
  } else {
    // 不死鳥神 — halo + flame
    // body smaller, surrounded by flames
    for (let y=12;y<22;y++){
      for (let x=12;x<20;x++){
        const dx=x-16, dy=y-17;
        if (dx*dx + dy*dy*1.2 < 14) put(x,y,'b');
      }
    }
    // flame aura
    const flame = [[8,10],[6,14],[8,20],[10,22],[14,24],[18,24],[22,22],[24,20],[26,14],[24,10],[22,8],[18,6],[14,6],[10,8]];
    flame.forEach(([x,y])=>{ put(x,y,'d'); put(x+1,y,'d'); put(x,y-1,'d'); });
    // inner flame ring
    for (let y=8;y<25;y++){
      for (let x=7;x<25;x++){
        const dx=x-16, dy=y-17;
        const r = dx*dx + dy*dy;
        if (r>40 && r<80 && S[y][x]==='.') put(x,y,'l');
      }
    }
    // eyes glow
    put(13,15,'w'); put(18,15,'w');
    put(14,15,'e'); put(19,15,'e');
    // beak
    put(15,18,'k'); put(16,18,'k');
    // crown/halo above
    put(13,6,'h'); put(16,4,'h'); put(19,6,'h');
  }
  return S;
}

function tinyGolem(stage){
  const S=Array.from({length:32},()=>'.'.repeat(32).split(''));
  const put=(x,y,v)=>{ if(y>=0&&y<32&&x>=0&&x<32) S[y][x]=v; };
  if (stage===1){
    // small rock cube
    for (let y=14;y<26;y++) for (let x=10;x<22;x++) put(x,y,'b');
    // chips (shading)
    for (let y=14;y<17;y++) for (let x=10;x<22;x++) put(x,y,'l');
    for (let y=23;y<26;y++) for (let x=10;x<22;x++) if (S[y][x]==='b') put(x,y,'d');
    // crystal spot
    put(19,16,'c'); put(20,17,'c');
    // eyes (glowing)
    put(13,19,'e'); put(17,19,'e');
    put(14,18,'w'); put(18,18,'w');
    // mouth
    put(14,22,'e'); put(15,22,'e'); put(16,22,'e');
    // feet
    put(11,26,'d'); put(12,26,'d'); put(19,26,'d'); put(20,26,'d');
  } else if (stage===2){
    // ゴーレム - bigger body + arms
    for (let y=9;y<26;y++) for (let x=8;x<24;x++) put(x,y,'b');
    // shoulders
    for (let y=12;y<20;y++) { put(6,y,'b'); put(7,y,'b'); put(24,y,'b'); put(25,y,'b'); }
    // head indent
    for (let y=9;y<12;y++) { put(8,y,'.'); put(9,y,'.'); put(22,y,'.'); put(23,y,'.'); }
    // shadings
    for (let y=9;y<12;y++) for (let x=10;x<22;x++) if (S[y][x]==='b') put(x,y,'l');
    for (let y=24;y<26;y++) for (let x=8;x<24;x++) if (S[y][x]==='b') put(x,y,'d');
    // crystals
    put(11,11,'c'); put(20,12,'c'); put(14,16,'c');
    // eyes
    put(12,15,'e'); put(18,15,'e');
    put(13,14,'w'); put(19,14,'w');
    // mouth
    for (let x=13;x<19;x++) put(x,19,'e');
  } else {
    // 鋼鉄巨人
    for (let y=5;y<28;y++) for (let x=4;x<28;x++) put(x,y,'b');
    // helmet
    for (let y=5;y<8;y++) for (let x=6;x<26;x++) put(x,y,'d');
    for (let y=8;y<12;y++) for (let x=7;x<25;x++) put(x,y,'l');
    // slits
    put(10,10,'c'); put(11,10,'c'); put(20,10,'c'); put(21,10,'c');
    // chest crystal
    for (let y=14;y<18;y++) for (let x=14;x<18;x++) put(x,y,'c');
    // shoulder studs
    put(4,12,'d'); put(5,12,'d'); put(26,12,'d'); put(27,12,'d');
    // rivets
    put(8,20,'d'); put(15,20,'d'); put(22,20,'d');
    // legs
    for (let y=27;y<29;y++) { for (let x=7;x<13;x++) put(x,y,'d'); for (let x=19;x<25;x++) put(x,y,'d'); }
    // highlight
    for (let y=13;y<18;y++) for (let x=5;x<8;x++) if (S[y][x]==='b') put(x,y,'l');
  }
  return S;
}

function getSprite(species, stage){
  switch(species){
    case 'dragon': return tinyDragon(stage);
    case 'unicorn': return tinyUnicorn(stage);
    case 'slime': return tinySlime(stage);
    case 'phoenix': return tinyPhoenix(stage);
    case 'golem': return tinyGolem(stage);
    default: return tinyDragon(stage);
  }
}

function drawPet(ctx, species, stage, px, py, scale=4, opts={}) {
  const sprite = getSprite(species, stage);
  const pal = PAL[species];
  const t = opts.time||0;
  // Idle float
  const bob = Math.round(Math.sin(t/400) * 1.2);
  for (let y=0;y<32;y++){
    for (let x=0;x<32;x++){
      const c = sprite[y][x];
      if (c==='.') continue;
      let color;
      switch(c){
        case 'b': color = pal.body; break;
        case 'l': color = pal.light; break;
        case 'd': color = pal.dark; break;
        case 'y': color = pal.belly; break;
        case 'e': color = pal.eye; break;
        case 'w': color = pal.white; break;
        case 'h': color = pal.horn || pal.light; break;
        case 'm': color = pal.mane || pal.dark; break;
        case 'k': color = pal.beak || pal.dark; break;
        case 'c': color = pal.crystal || pal.light; break;
        default: color = pal.body;
      }
      ctx.fillStyle = color;
      ctx.fillRect(px + x*scale, py + (y+bob)*scale, scale, scale);
    }
  }
  if (opts.shadow !== false) {
    // subtle shadow under
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    const sw = 24*scale, sh = 3*scale;
    ctx.fillRect(px + 4*scale, py + 30*scale, sw, sh);
  }
}

/* Create animated pet canvas that renders continuously */
function createPetCanvas(species, stage, size=128) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  canvas.className = 'pet';
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  const scale = Math.floor(size/32);
  let start = performance.now();
  function loop(){
    ctx.clearRect(0,0,size,size);
    drawPet(ctx, species, stage, 0, 0, scale, { time: performance.now() - start });
    canvas._raf = requestAnimationFrame(loop);
  }
  loop();
  canvas.destroy = ()=> cancelAnimationFrame(canvas._raf);
  return canvas;
}

window.PixelPet = { drawPet, getSprite, PAL, createPetCanvas };
