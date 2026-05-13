import { STAGES, HERBS, HLIST, rsName, EQUIPMENT, EQUIP_SLOTS, ITEMS, SHOP_ITEMS, TRIBULATION, DIFFICULTIES, TECHNIQUES, EVENTS } from './config.js';
import { game } from './state.js';
import { G, W, H, S as SC, TB } from './engine.js';
import { pix, ln, cir, cs, maxHP, maxMana, atkBase } from './utils.js';
import { getAllSlots } from './save.js';

// ===== 角色绘制 =====
export function drawHL(px, py) {
    const a = game.HL.anim;
    const fR = game.HL.mv ? Math.abs(game.HL.wA) <= Math.PI / 2 : Math.abs(game.HL.fA) <= Math.PI / 2;
    const d = fR ? 1 : -1;
    const cx = Math.round(px), cy = Math.round(py);
    const hW = Math.round(9 * SC), hH = Math.round(9 * SC), bW = Math.round(10 * SC), bH = Math.round(10 * SC);
    const lW = Math.round(5 * SC), lH = Math.round(7 * SC), aW = Math.round(3 * SC);
    const ftY = cy + Math.round(2 * SC), lgY = ftY - lH, bdY = lgY - bH + Math.round(1 * SC);
    const hdY = bdY - hH + Math.round(2 * SC), amY = bdY + Math.round(1 * SC);
    const sX = cx + d * Math.round(6 * SC);
    let lS0 = 0, lS1 = 0, aS0 = 0, aS1 = 0, bob = 0;
    if (a.st === 'walk' || game.HL.mv) {
        const f = a.wf;
        lS0 = Math.sin(f * Math.PI / 2) * Math.round(3 * SC); lS1 = -lS0;
        aS0 = -lS0 * 0.7; aS1 = -aS0;
        bob = Math.abs(Math.sin(f * Math.PI)) * Math.round(1.5 * SC);
    }
    let ext = 0, mlOn = false;
    if (a.st === 'attack') { const dr = 0.28; if (a.atkT < dr) { ext = a.atkT / dr; mlOn = true; } }
    const bY = -bob;
    cir(cx, ftY, Math.round(12 * SC), 'rgba(0,0,0,0.25)');
    const bkX = cx - d * Math.round(6 * SC);
    const lX0 = d === 1 ? cx - Math.round(5 * SC) : cx + Math.round(1 * SC);
    const lX1 = d === 1 ? cx + Math.round(1 * SC) : cx - Math.round(5 * SC);
    dLeg(lX0, lgY + bY, lW, lH, lS0, d);
    dLeg(lX1, lgY + bY, lW, lH, lS1, d);
    dArm(bkX, amY + bY, aW, aS0, 'back');
    dBody(cx, bdY + bY, bW, bH);
    dHead(cx, hdY + bY, hW, hH, d);
    dArmed(cx, sX, amY + bY, aW, aS1, game.HL.fA, ext, mlOn);
}

function dLeg(cx, cy, w, h, s, d) {
    const lx = d === 1 ? cx - Math.round(2 * SC) : cx;
    pix(lx, cy + s, w, h, '#3a3a3a');
    const fx = d === 1 ? cx - Math.round(1 * SC) : cx - Math.round(2 * SC);
    pix(fx, cy + h - Math.round(1 * SC) + s * 0.5, w + Math.round(2 * SC), Math.round(2 * SC), '#4a3020');
}
function dArm(cx, cy, w, s, wh) {
    pix(cx - Math.round(1 * SC), cy + s, w, Math.round(3 * SC), '#2d7d6f');
    pix(cx - Math.round(1 * SC), cy + Math.round(3 * SC) + s, w, Math.round(4 * SC), '#f5c6a0');
    if (wh === 'front') pix(cx - Math.round(1 * SC), cy + Math.round(7 * SC) + s, w, Math.round(2 * SC), '#f5c6a0');
}
function dHead(cx, cy, w, h, d) {
    pix(cx - Math.round(4 * SC), cy, w, h, '#f5c6a0');
    const eY = cy + Math.round(3 * SC), eS = Math.round(2 * SC), pS = Math.round(1 * SC);
    const eL = d === 1 ? Math.round(-3 * SC) : Math.round(1 * SC);
    const eR = d === 1 ? Math.round(1 * SC) : Math.round(-3 * SC);
    pix(cx + eL, eY, eS, eS, '#fff'); pix(cx + eR, eY, eS, eS, '#fff');
    const pL = d === 1 ? Math.round(-2.5 * SC) : Math.round(1.5 * SC);
    const pR = d === 1 ? Math.round(1.5 * SC) : Math.round(-2.5 * SC);
    pix(cx + pL, eY, pS, pS, '#000'); pix(cx + pR, eY, pS, pS, '#000');
    pix(cx - Math.round(1.5 * SC), cy + Math.round(7 * SC), Math.round(4 * SC), Math.round(1 * SC), '#c49a6c');
    pix(cx - Math.round(4 * SC), cy - Math.round(1 * SC), w, Math.round(3 * SC), '#1a1a1a');
    pix(cx - Math.round(1 * SC), cy - Math.round(4 * SC), Math.round(2 * SC), Math.round(3 * SC), '#1a1a1a');
}
function dBody(cx, cy, w, h) {
    pix(cx - Math.round(5 * SC), cy, w, h, '#2d7d6f');
    pix(cx - Math.round(5.5 * SC), cy + h - Math.round(1 * SC), w + Math.round(1 * SC), Math.round(2 * SC), '#1f5f53');
    pix(cx - Math.round(3 * SC), cy, Math.round(6 * SC), Math.round(2 * SC), '#f5c6a0');
    pix(cx - Math.round(3 * SC), cy + Math.round(2 * SC), Math.round(2 * SC), Math.round(4 * SC), 'rgba(255,255,255,0.1)');
    pix(cx - Math.round(4 * SC), cy + Math.round(5 * SC), w - Math.round(2 * SC), Math.round(1 * SC), '#1a4a3f');
}
function dArmed(cx, sX, cy, aW, sw, aim, ext, on) {
    const sk = '#f5c6a0', sl = '#2d7d6f';
    const gs = game.greatSwordT > 0 ? 3 : 1;
    const gsOff = game.greatSwordT > 0 ? Math.round(3 * SC) : 0;
    const eY = cy + Math.round(3 * SC) + sw;
    pix(sX - Math.round(1 * SC), cy + sw, aW, Math.round(3 * SC), sl);
    if (!on) {
        const al = Math.round(10 * SC) + ext * Math.round(6 * SC);
        const hx = sX + Math.cos(aim) * al, hy = eY - Math.round(2 * SC) + Math.sin(aim) * al;
        const perpX = -Math.sin(aim) * gsOff, perpY = Math.cos(aim) * gsOff;
        const sxX = hx + perpX, sxY = hy + perpY;
        ln(sX, cy + Math.round(3 * SC) + sw, hx, hy, sk, 3 * SC);
        cir(hx, hy, Math.round(2 * SC), sk);
        drawSwrd(sxX, sxY, aim, ext);
        return;
    }
    const swA = game.HL.anim.swL, sD = game.HL.anim.swS;
    const deg = sD + swA * ext, rad = deg * Math.PI / 180;
    const hl = Math.round(16 * SC);
    const hx = sX + Math.cos(rad) * hl, hy = cy + Math.sin(rad) * hl - Math.round(2 * SC);
    const perpX = -Math.sin(rad) * gsOff, perpY = Math.cos(rad) * gsOff;
    const sxX = hx + perpX, sxY = hy + perpY;
    ln(sX, cy + Math.round(3 * SC) + sw, hx, hy, sk, 3 * SC);
    cir(hx, hy, Math.round(2 * SC), sk);
    drawSwrd(sxX, sxY, rad, ext);
}
function drawSwrd(x, y, an, ext) {
    const gs = game.greatSwordT > 0 ? 3 : 1;
    const ca = Math.cos(an), sa = Math.sin(an);
    const pa = -sa, pb = ca;
    const gripL = Math.round(5 * SC) * gs;
    const guardHW = Math.round(2.5 * SC) * gs;
    const bladeL = Math.round(14 * SC) * gs;
    const tipL = Math.round(3 * SC) * gs;
    const sw = Math.round(SC) * gs;
    // grip center at (x,y), grip extends from center backwards
    const gTop = y - gripL / 2;
    pix(x - Math.round(1.5 * SC) * gs, gTop, Math.round(3 * SC) * gs, gripL, '#2a5a2a');
    // guard at (x,y)
    ln(x - pa * guardHW, y - pb * guardHW, x + pa * guardHW, y + pb * guardHW, '#50c060', 2.5 * gs);
    // blade extends forward from guard
    const bStart = Math.round(SC) * gs;
    const bx = x + ca * bStart, by = y + sa * bStart;
    const bEnd = bx + ca * bladeL, bEndY = by + sa * bladeL;
    const bW = Math.round(SC * 1.8) * gs;
    ln(bx - pa * Math.round(SC * 0.8) * gs, by - pb * Math.round(SC * 0.8) * gs, bEnd + ca * tipL, bEndY + sa * tipL, '#40c060', bW);
    ln(bx + pa * Math.round(SC * 0.8) * gs, by + pb * Math.round(SC * 0.8) * gs, bEnd + ca * tipL, bEndY + sa * tipL, '#40c060', bW);
    ln(bx, by, bEnd + ca * tipL, bEndY + sa * tipL, '#80ff80', 0.8 * gs);
    const tpX = bEnd + ca * (tipL + Math.round(SC * 0.5) * gs), tpY = bEndY + sa * (tipL + Math.round(SC * 0.5) * gs);
    if (ext > 0.3) { const fx = tpX + ca * Math.round(4 * SC) * gs, fy = tpY + sa * Math.round(4 * SC) * gs; G.circle('line', 'rgba(64,255,64,0.5)', [fx, fy], Math.round(3 * SC) * ext * gs, { lineWidth: 1.5 }); }
    if (game.greatSwordT > 0) { G.circle('line', 'rgba(255,128,64,0.35)', [x, y], Math.round(22 * SC), { lineWidth: 1 }); }
}

// ===== 盘旋飞剑 =====
function drawMiniSword(x, y, angle) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const pa = -sa, pb = ca;
    const gripL = Math.round(4 * SC);
    const guardHW = Math.round(3 * SC);
    const bladeL = Math.round(7 * SC);
    const tipL = Math.round(1.5 * SC);
    const gx = x - ca * gripL, gy = y - sa * gripL;
    ln(gx, gy, x, y, '#5a8a5a', Math.round(SC * 1.8));
    ln(x - pa * guardHW, y - pb * guardHW, x + pa * guardHW, y + pb * guardHW, '#50c060', 2.5);
    const bStart = Math.round(1.2 * SC);
    const bx = x + ca * bStart, by = y + sa * bStart;
    const bEnd = bx + ca * bladeL, bEndY = by + sa * bladeL;
    ln(bx - pa * Math.round(SC * 0.5), by - pb * Math.round(SC * 0.5), bEnd + ca * tipL, bEndY + sa * tipL, '#40c060', Math.round(SC * 1.3));
    ln(bx + pa * Math.round(SC * 0.5), by + pb * Math.round(SC * 0.5), bEnd + ca * tipL, bEndY + sa * tipL, '#40c060', Math.round(SC * 1.3));
    ln(bx, by, bEnd + ca * tipL, bEndY + sa * tipL, '#80ff80', 0.5);
}

export function drawOrbitSwords() {
    const r = Math.round(24 * SC);
    for (const sw of game.orbitSwords) {
        let sx, sy, sa;
        if (sw.state === 'orbit') {
            sx = game.HL.x + Math.cos(sw.angle) * r;
            sy = game.HL.y + Math.sin(sw.angle) * r;
            sa = sw.angle;
        } else {
            sx = sw.x; sx = sx || game.HL.x;
            sy = sw.y; sy = sy || game.HL.y;
            sa = sw.state === 'returning' ? Math.atan2(game.HL.y - sy, game.HL.x - sx) : Math.atan2(sw.vy, sw.vx);
        }
        drawMiniSword(sx, sy, sa);
    }
}

// ===== 敌人绘制 =====
function drawBoss(bs) {
    const s = bs.size;
    if (bs.name.includes('墨大夫')) {
        drawMoDaifu(bs);
        return;
    }
    if (bs.name === '墨蛟') {
        drawMoDragon(bs);
        return;
    }
    if (bs.name === '金蛟') {
        drawGoldDragon(bs);
        return;
    }
    if (bs.name === '万天明') {
        drawWanTianming(bs);
        return;
    }
    if (bs.name === '元刹圣祖') {
        drawYuanSha(bs);
        return;
    }
    if (bs.name === '呼老魔') {
        drawHuLaoMo(bs);
        return;
    }
    if (bs.name === '元刹圣祖分魂') {
        drawYuanShaSplit(bs);
        return;
    }
    // default boss
    cir(bs.x, bs.y, s, '#4a2a4a'); G.circle('line', '#fff', [bs.x, bs.y], s, { lineWidth: 3 });
    pix(bs.x - Math.round(s * 0.3), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    pix(bs.x + Math.round(s * 0.1), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    const hpP2 = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP2), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 墨大夫·莫居仁（完整人物） =====
function drawMoDaifu(bs) {
    const cx = Math.round(bs.x), cy = Math.round(bs.y);
    const hW = Math.round(8 * SC), hH = Math.round(8 * SC), bW = Math.round(9 * SC), bH = Math.round(10 * SC);
    const lW = Math.round(4 * SC), lH = Math.round(6 * SC);
    const ftY = cy + Math.round(10 * SC), lgY = ftY - lH, bdY = lgY - bH + Math.round(1 * SC);
    const hdY = bdY - hH + Math.round(2 * SC);
    const d = 1;
    cir(cx, ftY, Math.round(10 * SC), 'rgba(0,0,0,0.2)');
    dLeg(cx - Math.round(4 * SC), lgY, lW, lH, 0, d);
    dLeg(cx + Math.round(4 * SC), lgY, lW, lH, 0, d);
    pix(cx - Math.round(4.5 * SC), bdY, bW, bH, '#3a4a2a');
    // head - old man with gray hair
    pix(cx - Math.round(4 * SC), hdY, hW, hH, '#dcc0a0');
    pix(cx - Math.round(4.5 * SC), hdY - Math.round(1 * SC), Math.round(9 * SC), Math.round(2 * SC), '#aaa');
    // goatee beard
    pix(cx - Math.round(1 * SC), hdY + hH - Math.round(1 * SC), Math.round(2 * SC), Math.round(3 * SC), '#888');
    // cold piercing eyes
    pix(cx - Math.round(3 * SC), hdY + Math.round(3 * SC), Math.round(1.5 * SC), Math.round(1 * SC), '#fff');
    pix(cx + Math.round(1.5 * SC), hdY + Math.round(3 * SC), Math.round(1.5 * SC), Math.round(1 * SC), '#fff');
    pix(cx - Math.round(2.5 * SC), hdY + Math.round(3.5 * SC), Math.round(1 * SC), Math.round(0.8 * SC), '#111');
    pix(cx + Math.round(2 * SC), hdY + Math.round(3.5 * SC), Math.round(1 * SC), Math.round(0.8 * SC), '#111');
    // eyebrows - slanted down, sinister
    pix(cx - Math.round(3.5 * SC), hdY + Math.round(1.5 * SC), Math.round(2.5 * SC), Math.round(0.8 * SC), '#444');
    pix(cx + Math.round(1.5 * SC), hdY + Math.round(1.5 * SC), Math.round(2.5 * SC), Math.round(0.8 * SC), '#444');
    // mouth - thin cruel line
    pix(cx - Math.round(1.5 * SC), hdY + Math.round(5.5 * SC), Math.round(3 * SC), Math.round(0.5 * SC), '#733');
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(bs.size * 0.5), bs.y - Math.round(bs.size * 0.8), Math.round(bs.size), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(bs.size * 0.5), bs.y - Math.round(bs.size * 0.8), Math.round(bs.size * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(bs.size * 0.5), bs.y - Math.round(bs.size * 1)], { font: '10px monospace' });
}

// ===== 墨蛟（蛟龙） =====
function drawMoDragon(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#2a1a1a'); G.circle('line', '#4a2a2a', [bs.x, bs.y], s, { lineWidth: 3 });
    pix(bs.x - Math.round(s * 0.3), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    pix(bs.x + Math.round(s * 0.1), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    G.circle('line', '#5a4040', [bs.x, bs.y], s + 3, { lineWidth: 1.5 });
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 金蛟 =====
function drawGoldDragon(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#8a7a2a'); G.circle('line', '#f0d060', [bs.x, bs.y], s, { lineWidth: 3 });
    pix(bs.x - Math.round(s * 0.3), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    pix(bs.x + Math.round(s * 0.1), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
    G.circle('line', 'rgba(240,200,60,0.3)', [bs.x, bs.y], s + 4, { lineWidth: 1 });
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 万天明（枯瘦魔修） =====
function drawWanTianming(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#3a2a3a'); G.circle('line', '#8a6a8a', [bs.x, bs.y], s, { lineWidth: 3 });
    pix(bs.x - Math.round(s * 0.3), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#c0a0c0');
    pix(bs.x + Math.round(s * 0.1), bs.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#c0a0c0');
    pix(bs.x - Math.round(s * 0.2), bs.y, Math.round(s * 0.4), Math.round(s * 0.1), '#6a4a6a');
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 元刹圣祖 =====
function drawYuanSha(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#1a0a1a'); G.circle('line', '#c040c0', [bs.x, bs.y], s, { lineWidth: 4 });
    pix(bs.x - Math.round(s * 0.35), bs.y - Math.round(s * 0.35), Math.round(s * 0.25), Math.round(s * 0.25), '#f0f');
    pix(bs.x + Math.round(s * 0.1), bs.y - Math.round(s * 0.35), Math.round(s * 0.25), Math.round(s * 0.25), '#f0f');
    G.circle('line', 'rgba(200,40,200,0.3)', [bs.x, bs.y], s + 5, { lineWidth: 1.5 });
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 呼老魔 =====
function drawHuLaoMo(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#1a1a2a'); G.circle('line', '#6060c0', [bs.x, bs.y], s, { lineWidth: 3 });
    pix(bs.x - Math.round(s * 0.3), bs.y - Math.round(s * 0.3), Math.round(s * 0.25), Math.round(s * 0.25), '#f80');
    pix(bs.x + Math.round(s * 0.05), bs.y - Math.round(s * 0.3), Math.round(s * 0.25), Math.round(s * 0.25), '#f80');
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

// ===== 元刹圣祖分魂 =====
function drawYuanShaSplit(bs) {
    const s = bs.size;
    cir(bs.x, bs.y, s, '#0a0a0a'); G.circle('line', '#ff40ff', [bs.x, bs.y], s, { lineWidth: 4 });
    pix(bs.x - Math.round(s * 0.35), bs.y - Math.round(s * 0.35), Math.round(s * 0.3), Math.round(s * 0.3), '#f0f');
    pix(bs.x + Math.round(s * 0.05), bs.y - Math.round(s * 0.35), Math.round(s * 0.3), Math.round(s * 0.3), '#f0f');
    G.circle('line', 'rgba(255,40,255,0.4)', [bs.x, bs.y], s + 6, { lineWidth: 2 });
    const hpP = bs.hp / bs.maxHp;
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s), Math.round(2 * SC), '#300');
    pix(bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 0.8), Math.round(s * hpP), Math.round(2 * SC), '#f00');
    G.print('#ff0', bs.name, [bs.x - Math.round(s * 0.5), bs.y - Math.round(s * 1)], { font: '10px monospace' });
}

export function drawEn(e) {
    if (e.isBoss) { drawBoss(e); return; }
    const s = e.size;
    if (e.type === '弓手') {
        cir(e.x, e.y, s, '#5a6a3a'); G.circle('line', '#4a5a2a', [e.x, e.y], s, { lineWidth: 1.5 });
        pix(e.x - Math.round(s * 0.3), e.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f80');
        pix(e.x + Math.round(s * 0.1), e.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#f80');
        const ba2 = Math.atan2(game.HL.y - e.y, game.HL.x - e.x);
        G.circle('line', '#c04020', [e.x + Math.cos(ba2) * s * 0.6, e.y + Math.sin(ba2) * s * 0.6], s * 0.3, { lineWidth: 1 });
    } else if (e.type === '冲锋') {
        cir(e.x, e.y, s, '#8b5a2b'); G.circle('line', '#6b4a1b', [e.x, e.y], s, { lineWidth: 2 });
        pix(e.x - Math.round(s * 0.35), e.y - Math.round(s * 0.35), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
        pix(e.x + Math.round(s * 0.15), e.y - Math.round(s * 0.35), Math.round(s * 0.2), Math.round(s * 0.2), '#f00');
        if (e.charging) {
            G.circle('line', 'rgba(255,100,0,0.5)', [e.x, e.y], s + 3, { lineWidth: 2 });
        }
    } else if (e.type === '召唤师') {
        cir(e.x, e.y, s, '#5a3a6a'); G.circle('line', '#4a2a5a', [e.x, e.y], s, { lineWidth: 2 });
        pix(e.x - Math.round(s * 0.3), e.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#a0f');
        pix(e.x + Math.round(s * 0.1), e.y - Math.round(s * 0.3), Math.round(s * 0.2), Math.round(s * 0.2), '#a0f');
        G.circle('line', '#8060c0', [e.x, e.y], s + 2, { lineWidth: 1 });
    } else if (e.type === '凡人') {
        cir(e.x, e.y, s, '#8b7355'); G.circle('line', '#6b5335', [e.x, e.y], s, { lineWidth: 1.5 });
        pix(e.x - Math.round(s * 0.35), e.y - Math.round(s * 0.4), Math.round(s * 0.25), Math.round(s * 0.25), '#fff');
        pix(e.x + Math.round(s * 0.1), e.y - Math.round(s * 0.4), Math.round(s * 0.25), Math.round(s * 0.25), '#fff');
    } else if (e.type === '精英') {
        cir(e.x, e.y, s, '#8b3a3a'); G.circle('line', '#6b2a2a', [e.x, e.y], s, { lineWidth: 2 });
        pix(e.x - Math.round(s * 0.3), e.y - Math.round(s * 0.3), Math.round(s * 0.25), Math.round(s * 0.25), '#ff0');
        G.circle('line', '#f80', [e.x, e.y], s + 2, { lineWidth: 1 });
    } else {
        cir(e.x, e.y, s, '#6b3a3a'); G.circle('line', '#4b2a2a', [e.x, e.y], s, { lineWidth: 1.5 });
    }
}

// ===== 特效绘制 =====
export function drawFX() {
    for (const e of game.effects) {
        const p = e.life / e.ml;
        const a = p < 0.2 ? p / 0.2 : p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1;
        if (a <= 0) continue;
        if (e.tp === 'explosion') {
            const r = e.sz * (0.5 + p * 0.5);
            G.circle('fill', cs(e.cl, a * 0.4), [e.x, e.y], r);
            G.circle('line', cs(e.cl, a), [e.x, e.y], r + 2, { lineWidth: 2 - p * 1.5 });
        } else if (e.tp === 'flare') {
            const r = e.sz * (0.4 + p * 0.6);
            G.circle('fill', cs(e.cl, a * 0.6), [e.x, e.y], r);
            G.circle('line', cs('#ffdd60', a), [e.x, e.y], r + 1, { lineWidth: 1.5 - p });
        } else {
            G.circle('fill', cs(e.cl, a), [e.x, e.y], e.sz * (1 - p * 0.6));
            if (p > 0.2) G.circle('line', cs(e.cl, a * 0.3), [e.x, e.y], e.sz * 2, { lineWidth: 0.8 });
        }
    }
}

// ===== 战斗UI =====
export function drawUI() {
    const sd = STAGES[game.curS], rn = rsName(game.CL.realm, game.CL.stage), expP = game.CL.exp / game.CL.expToNext, bW = 110;
    G.rectangle('fill', [0.02, 0.03, 0.02, 0.88], [0, TB, W, 30]);
    G.rectangle('fill', [0.02, 0.03, 0.02, 0.88], [0, H - 36, W, 36]);
    const hpP = game.hp / maxHP(), mpP = game.mana / maxMana();
    G.print('#fff', '♥' + Math.round(game.hp) + '/' + maxHP(), [8, TB + 4], { font: '11px monospace' });
    G.rectangle('fill', [0.3, 0.05, 0.05, 0.6], [64, TB + 10, 56, 10]);
    G.rectangle('fill', [0.8, 0.1, 0.1, 0.8], [64, TB + 10, 56 * hpP, 10]);
    G.print('#fff', '✦' + Math.round(game.mana) + '/' + maxMana(), [128, TB + 4], { font: '11px monospace' });
    G.rectangle('fill', [0.05, 0.2, 0.5, 0.6], [184, TB + 10, 56, 10]);
    G.rectangle('fill', [0.1, 0.4, 0.9, 0.8], [184, TB + 10, 56 * mpP, 10]);
    G.print('#ffd700', rn, [248, TB + 4], { font: '13px monospace' });
    if (game.CL.breakRdy) G.print('#f80', '🔒 瓶颈', [248, TB + 18], { font: '10px monospace' });
    G.print('#aaa', 'EXP', [360, TB + 4], { font: '10px monospace' });
    G.rectangle('fill', [0.05, 0.05, 0.05, 0.6], [410, TB + 10, bW, 10]);
    G.rectangle('fill', [0.2, 0.6, 0.2, 0.8], [410, TB + 10, bW * expP, 10]);
    G.print('#ccc', Math.round(game.CL.exp) + '/' + game.CL.expToNext, [410 + bW + 4, TB + 4], { font: '10px monospace' });
    G.print('#cba', '副本：' + sd.name + '·' + sd.sub, [8, H - 32], { font: '12px monospace' });
    G.print('#aaa', '波次 ' + game.sWv + '/' + sd.waves + (game.bSp ? '  BOSS' : ''), [8, H - 18], { font: '11px monospace' });
    G.print('#888', '攻击:' + atkBase() + (game.CL.breakRdy ? ' | 突破:击败BOSS' : ''), [200, H - 32], { font: '10px monospace' });
    G.print('#aaa', '飞剑:' + game.swCnt + '/72 | 法力:5/击' + (game.atkBuf > 0 ? ' 🔥攻↑' : ''), [200, H - 18], { font: '10px monospace' });
    G.print('#0ff', '💎' + game.spiritStones, [W - 80, H - 32], { font: '12px monospace' });
    G.print('#555', 'ESC 暂停', [W / 2 - 25, H - 18], { font: '9px monospace' });
    if (game.sClr) G.print('#ff0', '🏆 副本通关！按 R 前往大厅', [W / 2 - 130, H / 2 - 10], { font: '16px monospace' });
    if (game.ntfT > 0) { G.print('#ffd700', game.ntf, [W / 2 - game.ntf.length * 4, TB + 55], { font: '14px monospace' }) }
}

// ===== 洞府装饰 =====
function seededRand(seed) { const s = Math.sin(seed) * 43758.5453; return s - Math.floor(s); }

function drawCaveRockery(x, y) {
    const gray = ['#3a3a3a','#4a4a4a','#2a2a2a','#555','#333','#4e4e4e','#383838','#2d2d2d','#444','#505050'];
    const base = x * 7919 + y * 6271;
    const count = 5 + Math.floor(seededRand(base + 1) * 6);
    for (let i = 0; i < count; i++) {
        const s0 = seededRand(base + i * 7 + 2);
        const s1 = seededRand(base + i * 7 + 3);
        const s2 = seededRand(base + i * 7 + 4);
        const s3 = seededRand(base + i * 7 + 5);
        const s4 = seededRand(base + i * 7 + 6);
        const s5 = seededRand(base + i * 7 + 7);
        const s6 = seededRand(base + i * 7 + 8);
        const w = 8 + s0 * 28, h = 6 + s1 * 24;
        const ox = -16 + s2 * 32, oy = -40 + s3 * 30;
        const px1 = x + ox, py1 = y + oy;
        const px2 = px1 + w * (0.3 + s4 * 0.7);
        const cl = gray[Math.floor(s5 * gray.length)];
        for (let r = Math.round(h); r >= 0; r--) {
            const t = r / h, lw = Math.round(w * (1 - t) * (0.3 + seededRand(base + i * 17 + r) * 0.4));
            const rx = px1 + Math.round((px2 - px1) * t);
            pix(rx - lw, py1 - r, lw * 2, 1, cl);
        }
        if (s6 < 0.3) pix(px1 + seededRand(base + i * 11) * w * 0.6 - 4, py1 - h + seededRand(base + i * 13) * 3, 2 + seededRand(base + i * 19) * 3, 1, '#222');
    }
}

function drawCaveSpring(x, y) {
    const r = 16;
    cir(x, y, r, '#2a5a6a');
    cir(x, y, r - 2, '#3a6a8a');
    cir(x, y, r - 6, '#1a3a4a');
    pix(x - 2, y - r - 6, 4, 8, '#3a5a7a');
    pix(x - 1, y - r - 10, 2, 6, '#4a6a8a');
    for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        cir(x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4), 1, '#5a9aba');
    }
    G.print('#4a7a8a', '灵泉', [x - 10, y + r + 2], { font: '10px monospace' });
}

function drawCaveTable(x, y) {
    pix(x - 15, y, 30, 4, '#5a4a3a');
    pix(x - 12, y + 4, 4, 14, '#4a3a2a');
    pix(x + 8, y + 4, 4, 14, '#4a3a2a');
    pix(x - 10, y + 14, 20, 2, '#3a2a1a');
}

function drawCaveChest(x, y) {
    pix(x - 12, y - 10, 24, 18, '#6a4a2a');
    pix(x - 14, y - 12, 28, 4, '#7a5a3a');
    pix(x - 10, y - 6, 20, 14, '#5a3a1a');
    pix(x, y - 4, 4, 3, '#d4af37');
    pix(x - 8, y - 4, 2, 3, '#d4af37');
    pix(x + 6, y - 4, 2, 3, '#d4af37');
    G.print('#d4af37', '宝箱', [x - 10, y + 10], { font: '10px monospace' });
}

function drawCavePortal(x, y) {
    const r = 18;
    for (let i = r; i > 0; i -= 3) {
        const a = 0.15 + (i / r) * 0.35;
        G.circle('line', 'rgba(100,200,255,' + a + ')', [x, y], i, { lineWidth: 1.5 });
    }
    cir(x, y, 4, '#80d0ff');
    for (let i = 0; i < 6; i++) {
        const an = i * Math.PI / 3 + game.bottleGlowT;
        const pr = 10 + Math.sin(game.bottleGlowT * 2 + i) * 4;
        cir(x + Math.cos(an) * pr, y + Math.sin(an) * pr, 1, '#80d0ff');
    }
    G.print('#6af', '传送阵', [x - 16, y + r + 2], { font: '10px monospace' });
}

// ===== 药园角色绘制 =====
export function drawGardenHL(px, py) {
    const a = game.gHL.anim; const fR = game.gHL.mv ? Math.abs(game.gHL.wA) <= Math.PI / 2 : game.gHL.facing > 0;
    const d = (fR ? 1 : -1), cx = Math.round(px), cy = Math.round(py);
    const hW = Math.round(9 * SC), hH = Math.round(9 * SC), bW = Math.round(10 * SC), bH = Math.round(10 * SC);
    const lW = Math.round(5 * SC), lH = Math.round(7 * SC);
    const ftY = cy + Math.round(2 * SC), lgY = ftY - lH, bdY = lgY - bH + Math.round(1 * SC);
    const hdY = bdY - hH + Math.round(2 * SC);
    let lS0 = 0, lS1 = 0, bob = 0;
    if (game.gHL.mv) { const f = a.wf; lS0 = Math.sin(f * Math.PI / 2) * Math.round(3 * SC); lS1 = -lS0; bob = Math.abs(Math.sin(f * Math.PI)) * Math.round(1.5 * SC) }
    const bY = -bob;
    cir(cx, ftY, Math.round(12 * SC), 'rgba(0,0,0,0.2)');
    const glX0 = d === 1 ? cx - Math.round(5 * SC) : cx + Math.round(1 * SC);
    const glX1 = d === 1 ? cx + Math.round(1 * SC) : cx - Math.round(5 * SC);
    dLeg(glX0, lgY + bY, lW, lH, lS0, d); dLeg(glX1, lgY + bY, lW, lH, lS1, d);
    pix(cx - Math.round(5 * SC), bdY + bY, bW, bH, '#2d7d6f');
    dHead(cx, hdY + bY, hW, hH, d);
    pix(cx - d * Math.round(6 * SC) - Math.round(1 * SC), bdY + Math.round(1 * SC) + bY, Math.round(3 * SC), Math.round(3 * SC), '#2d7d6f');
    pix(cx + d * Math.round(6 * SC) - Math.round(1 * SC), bdY + Math.round(1 * SC) + bY, Math.round(3 * SC), Math.round(3 * SC), '#2d7d6f');
    pix(cx - d * Math.round(6 * SC) - Math.round(1 * SC), bdY + Math.round(4 * SC) + bY, Math.round(3 * SC), Math.round(4 * SC), '#f5c6a0');
    pix(cx + d * Math.round(6 * SC) - Math.round(1 * SC), bdY + Math.round(4 * SC) + bY, Math.round(3 * SC), Math.round(4 * SC), '#f5c6a0');
}

export function drawGardenTree(tx, ty, sz) {
    pix(tx, ty - sz * 2, sz * 0.3, sz * 2, '#3a2510');
    pix(tx - sz * 0.1, ty - sz * 2, sz * 0.5, sz * 0.3, '#4a3520');
    cir(tx, ty - sz * 2.8, sz * 0.9, '#1a4a1a');
    cir(tx - sz * 0.4, ty - sz * 3, sz * 0.7, '#1a5a1a');
    cir(tx + sz * 0.4, ty - sz * 2.6, sz * 0.7, '#1a4a1a');
    cir(tx, ty - sz * 3.2, sz * 0.5, '#2a6a2a');
}

export function drawGardenWell(wx, wy) {
    pix(wx - 12, wy - 8, 24, 20, '#5a4a3a');
    pix(wx - 14, wy - 10, 28, 4, '#6a5a4a');
    pix(wx - 14, wy + 10, 28, 4, '#6a5a4a');
    pix(wx - 10, wy - 4, 20, 12, '#3a5a8a');
    pix(wx - 2, wy - 18, 4, 10, '#5a4a3a');
    pix(wx - 8, wy - 20, 20, 3, '#5a4a3a');
    cir(wx, wy - 21, 3, '#4a3a2a');
}

export function drawBottleSprite(bx, by, liquid) {
    const liq = Math.max(0, Math.min(1, liquid));
    const cx = bx + 25;
    const yCap = by + 4, yNeck = by + 12, yBodyTop = by + 18, yMid = by + 30, yWidest = by + 38, yBot = by + 50;
    const wNeck = 4, wBodyTop = 8, wMid = 14, wWidest = 15, wBot = 9, wCap = 6;
    const glass = 'rgba(80,180,100,0.35)';
    const glassDark = 'rgba(40,120,60,0.7)';

    function oW(y) {
        if (y < yNeck) return wNeck;
        if (y < yBodyTop) return wNeck;
        if (y < yMid) return wBodyTop + (wMid - wBodyTop) * (y - yBodyTop) / (yMid - yBodyTop);
        if (y < yWidest) return wMid + (wWidest - wMid) * (y - yMid) / (yWidest - yMid);
        const t = (y - yWidest) / (yBot - yWidest);
        return wWidest - (wWidest - wBot) * t;
    }
    function iW(y) {
        if (y < yNeck) return 0;
        if (y < yBodyTop) return Math.max(0, wNeck - 2);
        if (y < yMid) return (wBodyTop - 2) + (wMid - 2 - (wBodyTop - 2)) * (y - yBodyTop) / (yMid - yBodyTop);
        if (y < yWidest) return (wMid - 2) + (wWidest - 2 - (wMid - 2)) * (y - yMid) / (yWidest - yMid);
        const t = (y - yWidest) / (yBot - yWidest);
        return (wWidest - 2) - ((wWidest - 2) - (wBot - 2)) * t;
    }

    for (let y = yBodyTop; y <= yBot; y++) { const ow = Math.round(oW(y)); pix(cx - ow, y, ow * 2, 1, glass) }
    for (let y = yNeck; y < yBodyTop; y++) pix(cx - wNeck, y, wNeck * 2, 1, glass);

    if (liq > 0) {
        const liqH = (yBot - yBodyTop) * liq, liqY = yBot - liqH;
        for (let y = Math.max(yBodyTop, Math.round(liqY)); y <= yBot; y++) {
            const iw = Math.round(iW(y)); if (iw > 0) pix(cx - iw, y, iw * 2, 1, '#3EA52E');
        }
        if (liqY >= yBodyTop) {
            const siw = Math.round(iW(Math.round(liqY)));
            pix(cx - siw + 1, Math.round(liqY), siw * 2 - 2, 2, '#7ED957');
        }
    }

    const greenCapTop = yNeck - 1 - 7;
    pix(cx - wCap, greenCapTop, wCap * 2, 7, '#1a5a1a');
    pix(cx - wCap + 1, greenCapTop + 1, wCap * 2 - 2, 5, '#2a7a2a');
    pix(cx - 1, greenCapTop, 2, 3, '#3a9a3a');
    pix(cx - wNeck - 1, yNeck - 1, wNeck * 2 + 2, 2, '#D4AF37');

    for (let y = yBodyTop; y < yBot; y += 4) { const ow = Math.round(oW(y)); pix(cx - ow, y, 1, 1, glassDark); pix(cx + ow - 1, y, 1, 1, glassDark) }

    pix(cx - wMid + 3, yMid + 2, 1, 8, '#D4F1F9');
    pix(cx - wMid + 4, yMid + 4, 1, 4, 'rgba(212,241,249,0.35)');
    for (let i = 0; i < 4; i++) pix(cx - wMid + 4 + i * 7, yMid + 6, 3, 1, '#D4AF37');

    const breath = 0.5 + 0.5 * Math.sin(game.bottleGlowT * 3);
    const glowA = 0.06 + breath * 0.12;
    for (let y = yNeck; y <= yBot; y++) {
        const ow = Math.round(oW(y));
        if (y >= yBodyTop) {
            pix(cx - ow - 2, y, 1, 1, 'rgba(80,255,120,' + glowA + ')');
            pix(cx + ow + 1, y, 1, 1, 'rgba(80,255,120,' + glowA + ')');
        }
    }
    for (let y = yNeck; y <= yBot; y++) {
        const ow = Math.round(oW(y));
        const ga2 = Math.max(0, glowA - 0.04);
        if (y >= yBodyTop) {
            pix(cx - ow - 4, y, 1, 1, 'rgba(120,255,160,' + ga2 + ')');
            pix(cx + ow + 3, y, 1, 1, 'rgba(120,255,160,' + ga2 + ')');
        }
    }
    const wb = Math.round(oW(yBot));
    for (let x = -wb - 2; x <= wb + 1; x++) pix(cx + x, yBot + 1, 1, 1, 'rgba(80,255,120,' + (glowA * 0.5) + ')');
    for (let x = -wb - 4; x <= wb + 3; x++) pix(cx + x, yBot + 2, 1, 1, 'rgba(120,255,160,' + (Math.max(0, glowA - 0.04) * 0.5) + ')');
}

export function drawHerbSprite(px, py, herbName, stage, maxStage) {
    const hb = HERBS[herbName]; if (!hb) return;
    const cl = hb.cl;
    const prog = stage / maxStage;
    if (prog <= 0) {
        pix(px - 4, py - 2, 8, 4, '#3a2a1a');
        pix(px - 2, py - 4, 4, 3, '#4a3a2a');
    } else if (prog < 0.4) {
        pix(px - 4, py - 2, 8, 4, '#3a2a1a');
        pix(px, py - 2, 2, 8, '#2a6a2a');
        cir(px + 1, py - 6, 3, '#3a8a3a');
    } else if (prog < 1) {
        pix(px - 4, py - 2, 8, 4, '#3a2a1a');
        pix(px, py - 2, 3, 16, '#2a6a2a');
        cir(px - 4, py - 12, 4, cl);
        cir(px + 4, py - 10, 3, cl);
        cir(px, py - 16, 3, '#3a8a3a');
        pix(px - 1, py - 6, 2, 5, cl);
    } else {
        pix(px - 4, py - 2, 8, 4, '#3a2a1a');
        pix(px, py - 2, 3, 20, '#2a6a2a');
        cir(px - 5, py - 14, 5, cl);
        cir(px + 5, py - 12, 5, cl);
        cir(px, py - 20, 4, cl);
        cir(px - 3, py - 8, 3, cl);
        pix(px - 1, py - 10, 2, 6, '#fff8');
        G.circle('line', 'rgba(255,255,100,0.4)', [px, py - 12], 10, { lineWidth: 1 });
    }
    if (prog < 1 && prog > 0) {
        pix(px - 7, py - 20, 14, 26, 'rgba(60,60,60,' + (0.55 - prog * 0.4) + ')');
    }
}

export function drawCave() {
    G.clear('#1a0f0a');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#140a06', [x, y, 40, 40]);

    for (let x = 0; x < W; x += 120) { pix(x, 0, 60, 4, '#2a1a0f'); pix(x + 20, 0, 20, 8, '#1a0f06'); }
    for (let y = 80; y < H - 40; y += 80) { pix(W - 8, y, 8, 30, '#1f0f08'); pix(0, y + 20, 8, 30, '#1f0f08'); }

    drawCaveRockery(80, 160);
    drawCaveRockery(200, 380);
    drawCaveRockery(540, 200);
    drawCaveRockery(640, 350);
    drawCaveRockery(320, 100);

    drawCaveSpring(120, 310);

    drawCaveTable(400, 280);
    pix(360, 298, 4, 10, '#4a3a2a');
    pix(432, 298, 4, 10, '#4a3a2a');

    drawGardenTree(60, 140, 22);
    drawGardenTree(690, 130, 20);
    drawGardenTree(720, 400, 20);
    drawGardenTree(50, 540, 16);
    drawGardenTree(700, 530, 19);

    drawGardenWell(680, 160);

    pix(100, 460, 600, 80, '#1a2a0f');
    for (let i = 0; i < 8; i++) { pix(100 + i * 80 + 20, 455, 3, 8, '#2a3a1a'); pix(100 + i * 80 + 22, 450, 2, 6, '#3a4a2a') }

    for (let i = 0; i < game.cavePlots.length; i++) {
        const p = game.cavePlots[i];
        const px = p.x, py = p.y;
        if (!p.unlocked) {
            G.rectangle('fill', '#1a1a1a', [px, py, 70, 55]);
            G.rectangle('fill', '#111', [px + 2, py + 2, 66, 51]);
            G.print('#555', '🔒', [px + 35 - 5, py + 27.5 - 10], { font: '16px monospace' });
            const dx = game.gHL.x - (px + 35), dy = game.gHL.y - (py + 27.5);
            if (Math.hypot(dx, dy) < 50) {
                G.rectangle('line', '#888', [px - 1, py - 1, 72, 57], { lineWidth: 1.5 });
                const nextIdx = game.cavePlots.findIndex(pp => !pp.unlocked);
                if (nextIdx === i) {
                    const cost = [0, 0, 20, 50, 100, 200, 400, 800, 1600, 3200][i];
                    G.print(game.spiritStones >= cost ? '#ff0' : '#f44', 'E 开辟 ' + cost + '灵石', [px + 35 - 36, py + 55 + 4], { font: '9px monospace' });
                }
            }
            continue;
        }
        G.rectangle('fill', '#2a1a0a', [px, py, 70, 55]);
        G.rectangle('fill', '#3a2a1a', [px + 2, py + 2, 66, 51]);

        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
            const tx = px + 6 + c * 15, ty = py + 6 + r * 15;
            G.rectangle('fill', '#4a3a22', [tx, ty, 12, 12]);
            G.rectangle('fill', '#3a2a18', [tx + 1, ty + 1, 10, 10]);
        }

        if (p.planted) {
            const hb = HERBS[p.planted];
            drawHerbSprite(px + 35, py + 55 - 4, p.planted, p.gr, hb.gr);
            if (p.watered && p.waterAnm > 0) {
                cir(px + 35, py + 27.5, 8 * p.waterAnm, 'rgba(100,150,255,' + p.waterAnm * 0.4 + ')');
            }
            G.print('#aaa', p.planted, [px + 2, py - 12], { font: '9px monospace' });
            G.print('#888', p.gr + '/' + hb.gr, [px + 70 - 20, py - 12], { font: '9px monospace' });
        } else {
            G.print('#444', '空地', [px + 35 - 12, py + 27.5 - 4], { font: '10px monospace' });
        }

        const dx = game.gHL.x - (px + 35), dy = game.gHL.y - (py + 27.5);
        const d = Math.hypot(dx, dy);
        if (d < 50) {
            G.rectangle('line', '#ffd700', [px - 1, py - 1, 72, 57], { lineWidth: 1.5 });
            if (p.planted) {
                const hb = HERBS[p.planted];
                if (p.gr >= hb.gr) {
                    G.print('#ff0', 'F 采集', [px + 35 - 16, py + 55 + 4], { font: '10px monospace' });
                } else if (!p.watered) {
                    G.print('#6af', 'E 浇水', [px + 35 - 24, py + 55 + 4], { font: '10px monospace' });
                    G.print(game.bottleLiquid >= 0.5 ? '#0f0' : '#666', 'Q 瓶灌', [px + 35 + 8, py + 55 + 4], { font: '10px monospace' });
                } else {
                    G.print('#888', '已浇灌', [px + 35 - 16, py + 55 + 4], { font: '10px monospace' });
                    if (game.bottleLiquid >= 0.5) G.print('#0f0', 'Q 瓶灌', [px + 35 + 8, py + 55 + 4], { font: '10px monospace' });
                }
            } else {
                G.print('#8f8', 'E 种植', [px + 35 - 14, py + 55 + 4], { font: '10px monospace' });
            }
        }
    }

    const chD = Math.hypot(game.gHL.x - 680, game.gHL.y - 480);
    const tbD = Math.hypot(game.gHL.x - 400, game.gHL.y - 280);
    if (chD < 60) { G.print('#ffd700', 'E 打开宝箱', [640, 500], { font: '10px monospace' }); }
    if (tbD < 60) { G.print('#ffd700', 'E 查看背包', [370, 305], { font: '10px monospace' }); }
    G.print('#555', 'ESC 返回大厅', [W / 2 - 35, 20], { font: '9px monospace' });

    drawCaveChest(680, 480);

    drawGardenHL(game.gHL.x, game.gHL.y);

    drawBottleSprite(W - 70, 35, game.bottleLiquid);
    const pctG = Math.round(game.bottleLiquid * 100);
    const pctClG = game.bottleLiquid >= 0.5 ? '#7ED957' : '#f80';
    G.print(pctClG, '灵液 ' + pctG + '%', [W - 73, 98], { font: '11px monospace' });

    G.rectangle('fill', [0.02, 0.03, 0.02, 0.88], [0, 0, W, 28]);
    G.print('#ffd700', '⚔ 洞 府', [10, 16], { font: '14px monospace' });
    G.print('#0ff', '💎 ' + game.spiritStones, [120, 16], { font: '12px monospace' });
    const expPc = game.CL.exp / game.CL.expToNext;
    G.print('#ddd', 'EXP', [240, 7], { font: '8px monospace' });
    G.rectangle('fill', [0.05, 0.05, 0.05, 0.5], [280, 6, 100, 8]);
    G.rectangle('fill', [0.2, 0.6, 0.2, 0.8], [280, 6, 100 * expPc, 8]);
    G.print('#ccc', Math.round(game.CL.exp) + '/' + game.CL.expToNext, [385, 7], { font: '8px monospace' });
    G.print('#aaa', 'E操作灵田/宝箱 | F采集 | Q瓶灌', [240, 18], { font: '9px monospace' });

    G.rectangle('fill', [0.02, 0.03, 0.02, 0.88], [0, H - 28, W, 28]);
    const rn = rsName(game.CL.realm, game.CL.stage);
    G.print('#aaa', rn, [10, H - 22], { font: '10px monospace' });
    let invText = '背包：';
    let hasItem = false;
    for (const k in game.inventory) { if (game.inventory[k]) { invText += k + '×' + game.inventory[k] + ' '; hasItem = true } }
    if (!hasItem) invText += '空';
    G.print('#8a8', invText, [180, H - 22], { font: '10px monospace' });

    if (game.herbMenuOpen) {
        drawHerbMenu();
    }

    if (game.ntfT > 0) { G.print('#ffd700', game.ntf, [W / 2 - game.ntf.length * 4, 40], { font: '14px monospace' }) }
}

export function drawHerbMenu() {
    const mx = W / 2 - 140, my = H / 2 - 120, mw = 280, mh = 240;
    G.rectangle('fill', [0.05, 0.04, 0.02, 0.95], [mx, my, mw, mh]);
    G.rectangle('line', '#ffd700', [mx, my, mw, mh], { lineWidth: 2 });
    G.print('#ffd700', '🌱 选择灵草种植', [mx + 20, my + 12], { font: '14px monospace' });
    let yy = my + 38;
    for (let i = 0; i < HLIST.length; i++) {
        const nm = HLIST[i], hb = HERBS[nm], sel = i === game.herbMenuSel;
        G.rectangle('fill', sel ? [0.12, 0.1, 0.04, 0.8] : [0.04, 0.03, 0.02, 0.5], [mx + 10, yy, mw - 20, 26]);
        if (sel) G.rectangle('line', '#ffd700', [mx + 10, yy, mw - 20, 26], { lineWidth: 1 });
        cir(mx + 24, yy + 10, 4, hb.cl);
        G.print(sel ? '#fff' : '#aaa', nm + ' (' + hb.gr + '波成熟) → ' + hb.yield, [mx + 36, yy + 4], { font: '11px monospace' });
        G.print('#666', hb.desc, [mx + 36, yy + 16], { font: '9px monospace' });
        yy += 28;
    }
    G.print('#888', '↑↓ 选择  Enter确认  ESC取消', [mx + 20, yy + 8], { font: '10px monospace' });
}

// ===== 装备界面 =====
export function drawEquipment() {
    G.clear('#0a0a0f');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#060610', [x, y, 40, 40]);

    G.print('#ffd700', '🛡 装 备 整 理', [W / 2 - 80, 20], { font: '22px monospace' });
    G.print('#0ff', '💎 ' + game.spiritStones, [W - 120, 22], { font: '12px monospace' });
    G.print('#888', 'ESC 返回营地', [W - 140, 42], { font: '10px monospace' });

    const slotOx = 160, slotW = 480;
    for (let si = 0; si < EQUIP_SLOTS.length; si++) {
        const slot = EQUIP_SLOTS[si];
        const sy = 80 + si * 160;
        const sel = si === game.eSelSlot;

        G.rectangle('fill', sel ? [0.08, 0.06, 0.03, 0.85] : [0.04, 0.03, 0.02, 0.6], [slotOx, sy, slotW, 130]);
        if (sel) G.rectangle('line', '#ffd700', [slotOx, sy, slotW, 130], { lineWidth: 2 });

        G.print('#ddd', slot, [slotOx + 12, sy + 10], { font: '16px monospace' });

        const list = EQUIPMENT[slot];
        const curId = game.eSlots[slot];
        for (let ii = 0; ii < list.length; ii++) {
            const item = list[ii];
            const ix = slotOx + 120 + ii * 140, iy = sy + 30;
            const iSel = sel && ii === game.eSelItem;
            const equipped = item.id === curId;

            G.rectangle('fill', iSel ? [0.1, 0.08, 0.02, 0.8] : [0.03, 0.02, 0.02, 0.5], [ix, iy, 120, 88]);
            if (equipped) G.rectangle('line', '#ffd700', [ix, iy, 120, 88], { lineWidth: 2 });
            else if (iSel) G.rectangle('line', '#aaa', [ix, iy, 120, 88], { lineWidth: 1 });

            const cl = equipped ? '#ffd700' : iSel ? '#fff' : '#aaa';
            G.print(cl, item.name, [ix + 6, iy + 8], { font: '12px monospace' });
            G.print('#888', item.desc, [ix + 6, iy + 28], { font: '9px monospace' });

            if (equipped) {
                G.print('#ffd700', '✓ 已装备', [ix + 6, iy + 68], { font: '10px monospace' });
            } else if (!item.owned) {
                const canBuy = game.spiritStones >= item.price;
                G.print(canBuy ? '#0f0' : '#f44', '💎 ' + item.price, [ix + 6, iy + 52], { font: '10px monospace' });
                G.print('#888', 'Enter 购买', [ix + 6, iy + 68], { font: '10px monospace' });
            } else {
                G.print('#6af', 'Enter 装备', [ix + 6, iy + 58], { font: '10px monospace' });
            }
        }
    }

    G.print('#888', '↑↓ 切换类型  ←→ 选择装备  Enter 确认', [W / 2 - 160, H - 28], { font: '11px monospace' });
}

// ===== 背包界面 =====
export function drawInventory() {
    G.clear('#0a0a0f');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#060610', [x, y, 40, 40]);

    G.print('#ffd700', '🎒 背 包', [W / 2 - 50, 20], { font: '22px monospace' });
    G.print('#888', 'ESC 返回洞府', [W - 140, 22], { font: '10px monospace' });

    const keys = Object.keys(game.inventory);
    if (keys.length === 0) {
        G.print('#666', '背包空空如也...', [W / 2 - 80, H / 2 - 10], { font: '18px monospace' });
        G.print('#888', '在灵田种植收获灵草来获得道具', [W / 2 - 120, H / 2 + 16], { font: '11px monospace' });
    } else {
        const ox = 120, oy = 80;
        for (let i = 0; i < keys.length; i++) {
            const nm = keys[i], count = game.inventory[nm], item = ITEMS[nm];
            const sel = i === game.invSel;
            const ry = oy + i * 50;
            G.rectangle('fill', sel ? [0.1, 0.08, 0.02, 0.8] : [0.04, 0.03, 0.02, 0.5], [ox, ry, W - 240, 42]);
            if (sel) G.rectangle('line', '#ffd700', [ox, ry, W - 240, 42], { lineWidth: 1.5 });
            if (item) cir(ox + 18, ry + 21, 6, item.cl);
            const cl = sel ? '#fff' : '#aaa';
            G.print(cl, nm + ' ×' + count, [ox + 32, ry + 6], { font: '14px monospace' });
            G.print('#888', item ? item.desc : '', [ox + 32, ry + 24], { font: '10px monospace' });
            if (sel) G.print('#ffd700', 'Enter 使用', [W - 180, ry + 14], { font: '11px monospace' });
        }
    }

    G.print('#888', '↑↓ 选择  Enter 使用  ESC 返回', [W / 2 - 120, H - 28], { font: '11px monospace' });
}

// ===== 商店界面 =====
export function drawShop() {
    G.clear('#0a0a0f');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#060610', [x, y, 40, 40]);

    G.print('#ffd700', '🧪 灵 药 铺', [W / 2 - 60, 20], { font: '22px monospace' });
    G.print('#0ff', '💎 ' + game.spiritStones, [W - 120, 22], { font: '12px monospace' });
    G.print('#888', 'ESC 返回洞府', [W - 140, 42], { font: '10px monospace' });

    const ox = 140, oy = 80;
    for (let i = 0; i < SHOP_ITEMS.length; i++) {
        const item = SHOP_ITEMS[i], sel = i === game.shopSel;
        const ry = oy + i * 56;
        G.rectangle('fill', sel ? [0.1, 0.08, 0.02, 0.8] : [0.04, 0.03, 0.02, 0.5], [ox, ry, W - 280, 46]);
        if (sel) G.rectangle('line', '#ffd700', [ox, ry, W - 280, 46], { lineWidth: 1.5 });
        cir(ox + 18, ry + 23, 7, item.cl);
        const cl = sel ? '#fff' : '#aaa';
        G.print(cl, item.name, [ox + 32, ry + 6], { font: '14px monospace' });
        G.print('#888', item.desc, [ox + 32, ry + 26], { font: '10px monospace' });
        const canBuy = game.spiritStones >= item.price;
        G.print(canBuy ? '#0f0' : '#f66', '💎 ' + item.price, [W - 160, ry + 14], { font: '12px monospace' });
        if (sel) G.print('#ffd700', 'Enter 购买', [W - 240, ry + 14], { font: '11px monospace' });
    }

    G.print('#888', '↑↓ 选择  Enter 购买  ESC 返回', [W / 2 - 120, H - 28], { font: '11px monospace' });
}

// ===== 存档槽位公共绘制 =====
function drawSaveSlots(mode) {
    G.print('#555', 'ESC 返回大厅', [W / 2 - 45, 92], { font: '10px monospace' });
    if (game.saveConfirm >= 0) {
        const slot = getAllSlots()[game.saveConfirm];
        G.rectangle('fill', [0, 0, 0, 0.65], [0, 0, W, H]);
        G.rectangle('fill', [0.1, 0.05, 0.02, 0.95], [W / 2 - 160, H / 2 - 50, 320, 100]);
        G.rectangle('line', '#ffd700', [W / 2 - 160, H / 2 - 50, 320, 100], { lineWidth: 2 });
        G.print('#ff0', '⚠ 槽' + (game.saveConfirm + 1) + ' 已有存档', [W / 2 - 90, H / 2 - 36], { font: '14px monospace' });
        G.print('#ccc', slot.realm + ' | ' + slot.stageName + ' | ' + slot.time, [W / 2 - 130, H / 2 - 8], { font: '12px monospace' });
        G.print('#fff', 'Enter 确认覆盖  ← 取消', [W / 2 - 110, H / 2 + 20], { font: '11px monospace' });
        return;
    }
    const slots = getAllSlots();
    const oy = 105;
    for (let i = 0; i < slots.length; i++) {
        const s = slots[i], by = oy + i * 32, bx = W / 2 - 200, bw = 400, bh = 28;
        const sel = i === game.hubSel;
        const hasData = s.data !== null;
        G.rectangle('fill', sel ? [0.14, 0.1, 0.04, 0.9] : hasData ? [0.06, 0.05, 0.03, 0.7] : [0.03, 0.02, 0.01, 0.5], [bx, by, bw, bh]);
        G.rectangle('line', sel ? '#ffd700' : hasData ? '#444' : '#222', [bx, by, bw, bh], { lineWidth: sel ? 1.5 : 1 });
        if (hasData) {
            G.print(sel ? '#fff' : '#ccc', '槽' + (i + 1) + ' ' + s.realm + ' | ' + s.stageName, [bx + 10, by + 8], { font: '11px monospace' });
            G.print('#666', '💎' + (s.data.spiritStones || 0) + '  ' + s.time, [bx + 220, by + 8], { font: '9px monospace' });
        } else {
            G.print(sel ? '#fff' : '#555', '槽' + (i + 1) + ' —— 空 ——', [bx + 10, by + 8], { font: '11px monospace' });
        }
    }
    G.print('#888', '↑↓ 选择  Enter 存档  ESC 返回', [W / 2 - 100, 440], { font: '10px monospace' });
}

// ===== 标题画面 =====
export function drawTitle() {
    G.clear('#0a0a0a');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#060608', [x, y, 40, 40]);

    G.print('#ffd700', '凡 人 修 仙 传', [W / 2 - 90, 100], { font: '28px monospace' });
    G.print('#aaa', '像素肉鸽 · 韩立修仙', [W / 2 - 100, 135], { font: '14px monospace' });

    if (game.titleMode === 'difficulty') {
        G.print('#0f0', '选择难度', [W / 2 - 40, 190], { font: '16px monospace' });
        for (let i = 0; i < DIFFICULTIES.length; i++) {
            const sel = i === game.titleSel;
            const by = 230 + i * 52;
            G.rectangle('fill', sel ? [0.1, 0.06, 0.02, 0.8] : [0.04, 0.03, 0.02, 0.5], [290, by, 220, 44]);
            if (sel) G.rectangle('line', '#ffd700', [290, by, 220, 44], { lineWidth: 2 });
            const dcl = DIFFICULTIES[i] === '简单' ? '#0f0' : DIFFICULTIES[i] === '普通' ? '#fff' : DIFFICULTIES[i] === '困难' ? '#f80' : '#f00';
            G.print(sel ? '#ffd700' : dcl, DIFFICULTIES[i], [330, by + 12], { font: '16px monospace' });
        }
        G.print('#888', 'ESC 返回  Enter 确认', [W / 2 - 70, 440], { font: '12px monospace' });
        return;
    }

    if (game.titleMode === 'slots') {
        G.print('#0f0', '选择存档', [W / 2 - 35, 185], { font: '15px monospace' });
        const slots = getAllSlots();
        const oy = 210;
        for (let i = 0; i < slots.length; i++) {
            const s = slots[i], by = oy + i * 32, bx = W / 2 - 200, bw = 400, bh = 28;
            const sel = i === game.titleSel;
            const hasData = s.data !== null;
            G.rectangle('fill', sel ? [0.12, 0.1, 0.04, 0.9] : hasData ? [0.05, 0.04, 0.02, 0.7] : [0.03, 0.02, 0.01, 0.5], [bx, by, bw, bh]);
            G.rectangle('line', sel ? '#ffd700' : hasData ? '#444' : '#222', [bx, by, bw, bh], { lineWidth: sel ? 1.5 : 1 });
            if (hasData) {
                G.print(sel ? '#fff' : '#ccc', '槽' + (i + 1) + ' ' + s.realm + ' | ' + s.stageName, [bx + 10, by + 7], { font: '11px monospace' });
                G.print('#666', '💎' + (s.data.spiritStones || 0) + '  ' + s.time, [bx + 220, by + 7], { font: '9px monospace' });
            } else {
                G.print(sel ? '#fff' : '#555', '槽' + (i + 1) + ' —— 空 ——', [bx + 10, by + 7], { font: '11px monospace' });
            }
        }
        G.print('#888', '↑↓ 选择  Enter 载入(空槽开始新游戏)  ESC 返回', [W / 2 - 170, 530], { font: '10px monospace' });
        return;
    }

    const items = ['新游戏', '继续游戏'];
    const oy = 240;
    for (let i = 0; i < items.length; i++) {
        const sel = i === game.titleSel;
        G.rectangle('fill', sel ? [0.08, 0.06, 0.02, 0.8] : [0.04, 0.03, 0.02, 0.5], [290, oy + i * 70, 220, 50]);
        if (sel) G.rectangle('line', '#ffd700', [290, oy + i * 70, 220, 50], { lineWidth: 2 });
        G.print(sel ? '#ffd700' : '#888', items[i], [320, oy + i * 70 + 14], { font: '18px monospace' });
    }

    G.print('#555', '↑↓ 选择  Enter 确认', [W / 2 - 70, 440], { font: '12px monospace' });
}

// ===== 大厅/坊市入口 =====
export function drawHub() {
    G.clear('#0a0a12');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#08080e', [x, y, 40, 40]);

    G.print('#ffd700', '🏛 修仙大厅', [W / 2 - 70, 30], { font: '22px monospace' });
    G.print('#aaa', rsName(game.CL.realm, game.CL.stage) + ' · ' + game.difficulty + '难度', [W / 2 - 60, 56], { font: '11px monospace' });
    G.print('#0ff', '💎 ' + game.spiritStones, [W / 2 - 25, 74], { font: '11px monospace' });

    if (game.hubMode === 'stages') {
        G.print('#555', 'ESC 返回大厅', [W / 2 - 45, 92], { font: '10px monospace' });
        const cleared = game.clearedStages || [];
        const clearedSet = new Set(cleared);
        const oy = 105;
        for (let i = 0; i < STAGES.length; i++) {
            const st = STAGES[i], by = oy + i * 44, bx = W / 2 - 200, bw = 400, bh = 38;
            const sel = i === game.hubSel;
            const isCleared = clearedSet.has(i);
            const isUnlocked = isCleared || (cleared.length > 0 ? i <= Math.max(...cleared) + 1 : i === 0);
            const bgCl = sel ? [0.14, 0.1, 0.04, 0.9] : isUnlocked ? [0.06, 0.05, 0.03, 0.7] : [0.03, 0.02, 0.01, 0.5];
            const bdCl = sel ? '#ffd700' : isCleared ? '#0a0' : isUnlocked ? '#444' : '#222';
            G.rectangle('fill', bgCl, [bx, by, bw, bh]);
            G.rectangle('line', bdCl, [bx, by, bw, bh], { lineWidth: sel ? 2 : 1 });
            const icon = isCleared ? '✅' : isUnlocked ? '🔓' : '🔒';
            const cl = sel ? '#fff' : isUnlocked ? '#aaa' : '#555';
            G.print(cl, icon + ' ' + st.name, [bx + 12, by + 10], { font: '14px monospace' });
            G.print(isUnlocked ? '#666' : '#444', isUnlocked ? st.sub : '未解锁', [bx + 12, by + 26], { font: '9px monospace' });
            if (isUnlocked) G.print('#666', '�' + (20 + i * 10), [bx + bw - 70, by + 10], { font: '10px monospace' });
            if (isCleared) G.print('#0f0', '✓', [bx + bw - 30, by + 10], { font: '12px monospace' });
        }
    } else if (game.hubMode === 'techniques') {
        G.print('#555', 'ESC 返回大厅', [W / 2 - 45, 92], { font: '10px monospace' });
        const RNAME_INDEX2 = { '炼气': 0, '筑基': 1, '结丹': 2, '元婴': 3, '化神': 4 };
        const realmIdx = RNAME_INDEX2[game.CL.realm] || 0;
        const oy = 100;
        const hasBossT = game.bossTechs && game.bossTechs.length > 0;
        G.print('#888', '—— 基础功法 ——', [W / 2 - 45, oy - 5], { font: '9px monospace' });
        const baseList = TECHNIQUES.filter(t => t.type === 'base');
        for (let i = 0; i < baseList.length; i++) {
            const t = baseList[i], by = oy + i * 42, bx = W / 2 - 200, bw = 400, bh = 36;
            const sel = i === game.hubSel;
            const curLv = game.techLvs[t.id] || 0;
            const reqIdx = RNAME_INDEX2[t.realm] || 0;
            const isUnlocked = realmIdx >= reqIdx;
            const bgCl = sel ? [0.14, 0.1, 0.04, 0.9] : isUnlocked ? [0.06, 0.05, 0.03, 0.7] : [0.03, 0.02, 0.01, 0.5];
            G.rectangle('fill', bgCl, [bx, by, bw, bh]);
            G.rectangle('line', sel ? '#ffd700' : isUnlocked ? t.cl : '#222', [bx, by, bw, bh], { lineWidth: sel ? 2 : 1 });
            const cl = sel ? '#fff' : isUnlocked ? '#aaa' : '#555';
            const lvTxt = curLv > 0 ? '第' + ['一','二','三'][curLv - 1] + '重' : isUnlocked ? '未修炼' : ' 🔒';
            G.print(cl, t.name + '·' + lvTxt, [bx + 12, by + 10], { font: '13px monospace' });
            G.print('#666', t.desc, [bx + 12, by + 24], { font: '8px monospace' });
            if (isUnlocked) {
                if (curLv < t.tiers.length) {
                    const tier = t.tiers[curLv];
                    G.print('#0f0', '💎' + tier.cost + '→' + tier.label.split('·')[1], [bx + 170, by + 10], { font: '9px monospace' });
                } else {
                    G.print('#0f0', '✓ 已圆满', [bx + 170, by + 10], { font: '9px monospace' });
                }
            }
        }
        const bossStart = oy + baseList.length * 42 + 8;
        if (hasBossT) {
            G.print('#f80', '—— Boss秘传功法 ——', [W / 2 - 60, bossStart - 5], { font: '9px monospace' });
        }
        const bossList = TECHNIQUES.filter(t => t.type === 'boss');
        let bossVisible = 0;
        for (let i = 0; i < bossList.length; i++) {
            const t = bossList[i];
            const isOwned = game.bossTechs && game.bossTechs.includes(t.id);
            if (!isOwned) continue;
            const idx = baseList.length + bossVisible;
            const by = bossStart + bossVisible * 42, bx = W / 2 - 200, bw = 400, bh = 36;
            const sel = idx === game.hubSel;
            const curLv = game.techLvs[t.id] || 0;
            const bgCl = sel ? [0.16, 0.08, 0.06, 0.9] : [0.08, 0.04, 0.02, 0.7];
            G.rectangle('fill', bgCl, [bx, by, bw, bh]);
            G.rectangle('line', sel ? '#ffd700' : t.cl, [bx, by, bw, bh], { lineWidth: sel ? 2 : 1 });
            const cl = sel ? '#fff' : '#ddd';
            const lvTxt = curLv > 0 ? '已修习' : '待修炼';
            G.print(cl, t.name + '·' + lvTxt, [bx + 12, by + 10], { font: '13px monospace' });
            G.print('#aa8', t.spell || t.desc, [bx + 12, by + 24], { font: '8px monospace' });
            if (curLv < t.tiers.length) {
                const tier = t.tiers[curLv];
                G.print('#0f0', '💎' + tier.cost + '→' + tier.label.split('·')[1], [bx + 170, by + 10], { font: '9px monospace' });
            } else {
                G.print('#0f0', '✓ 已修习', [bx + 170, by + 10], { font: '9px monospace' });
            }
            bossVisible++;
        }
    } else if (game.hubMode === 'save') {
        drawSaveSlots('hub');
    } else {
        const items = ['⚔ 进入洞府', '🧪 进入坊市', '🗺 副本选择', '📖 功法修炼', '💾 存档'];
        const descs = ['休整、灵田、装备整理', '选购丹药与道具', '选择已通关或新副本挑战', '修炼被动功法增强实力', '手动存盘至存档槽'];
        const oy = 120;
        for (let i = 0; i < items.length; i++) {
            const bx = W / 2 - 180, by = oy + i * 60, bw = 360, bh = 48;
            const sel = i === game.hubSel;
            G.rectangle('fill', sel ? [0.12, 0.1, 0.04, 0.9] : [0.06, 0.05, 0.03, 0.7], [bx, by, bw, bh]);
            G.rectangle('line', sel ? '#ffd700' : '#333', [bx, by, bw, bh], { lineWidth: sel ? 2 : 1 });
            G.print(sel ? '#fff' : '#aaa', items[i], [bx + 16, by + 12], { font: '16px monospace' });
            G.print('#666', descs[i], [bx + 16, by + 32], { font: '10px monospace' });
        }
    }

    const hpP = game.hp / maxHP(), mpP = game.mana / maxMana(), expP = game.CL.exp / game.CL.expToNext;
    G.print('#ffd700', 'EXP', [W / 2 - 160, H - 130], { font: '9px monospace' });
    G.rectangle('fill', [0.05, 0.05, 0.05, 0.6], [W / 2 - 60, H - 128, 120, 8]);
    G.rectangle('fill', [0.2, 0.6, 0.2, 0.8], [W / 2 - 60, H - 128, 120 * expP, 8]);
    G.print('#ccc', Math.round(game.CL.exp) + '/' + game.CL.expToNext, [W / 2 + 70, H - 130], { font: '9px monospace' });
    G.print('#f66', '♥ ' + Math.round(game.hp) + '/' + maxHP(), [W / 2 - 160, H - 110], { font: '11px monospace' });
    G.rectangle('fill', [0.3, 0.05, 0.05, 0.6], [W / 2 - 60, H - 108, 120, 8]);
    G.rectangle('fill', [0.8, 0.1, 0.1, 0.8], [W / 2 - 60, H - 108, 120 * hpP, 8]);
    G.print('#6af', '✦ ' + Math.round(game.mana) + '/' + maxMana(), [W / 2 - 160, H - 90], { font: '11px monospace' });
    G.rectangle('fill', [0.05, 0.2, 0.5, 0.6], [W / 2 - 60, H - 88, 120, 8]);
    G.rectangle('fill', [0.1, 0.4, 0.9, 0.8], [W / 2 - 60, H - 88, 120 * mpP, 8]);

    G.print('#555', '↑↓ 选择  Enter 确认' + (game.hubMode === 'stages' || game.hubMode === 'techniques' || game.hubMode === 'save' ? '  ESC 返回' : ''), [W / 2 - 80, H - 26], { font: '11px monospace' });
}

// ===== 事件界面 =====
export function drawEvent() {
    G.clear('#0a080a');
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#080608', [x, y, 40, 40]);

    const ev = EVENTS.find(e => e.id === game.eventId);
    if (!ev) return;

    G.print('#ffd700', '✦ ' + ev.name, [W / 2 - 60, 30], { font: '20px monospace' });

    const lines = wrapText(ev.text, 52);
    for (let i = 0; i < lines.length; i++) {
        G.print('#ccc', lines[i], [W / 2 - 200, 90 + i * 22], { font: '12px monospace' });
    }

    const oy = 90 + lines.length * 22 + 20;
    for (let i = 0; i < 2; i++) {
        const by = oy + i * 72, bx = W / 2 - 200, bw = 400, bh = 52;
        const sel = i === game.eventSel;
        G.rectangle('fill', sel ? [0.14, 0.1, 0.04, 0.9] : [0.06, 0.05, 0.03, 0.7], [bx, by, bw, bh]);
        G.rectangle('line', sel ? '#ffd700' : '#444', [bx, by, bw, bh], { lineWidth: sel ? 2 : 1 });
        G.print(sel ? '#fff' : '#aaa', '▸ ' + (i === 0 ? ev.option1 : ev.option2), [bx + 12, by + 16], { font: '14px monospace' });
    }

    G.print('#555', '↑↓ 选择  Enter 确认', [W / 2 - 70, H - 30], { font: '11px monospace' });
}

// ===== 对话界面 =====
export function drawDialogue() {
    G.rectangle('fill', [0, 0, 0, 0.45], [0, H / 2 - 10, W, H / 2 + 70]);
    G.rectangle('line', '#ffffff', [W / 2 - 360, H / 2, 720, 180], { lineWidth: 2 });
    G.rectangle('fill', [0.02, 0.02, 0.06, 0.92], [W / 2 - 358, H / 2 + 2, 716, 176]);

    const line = game.dialogueLines[game.dialogueIdx];
    if (!line) return;

    const sp = line.speaker;
    const text = line.text;
    const bpName = STAGES[game.curS].boss.name;

    if (sp === 'boss') {
        G.print('#ffd700', bpName, [W / 2 - 318, H / 2 + 8], { font: '13px monospace' });
    } else if (sp === 'han') {
        G.print('#6af', '韩立', [W / 2 + 270, H / 2 + 8], { font: '13px monospace' });
    }

    const lines = wrapText(text, 50);
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
        G.print('#eee', lines[i], [W / 2 - 318, H / 2 + 40 + i * 22], { font: '13px monospace' });
    }

    const remaining = game.dialogueLines.length - game.dialogueIdx - 1;
    const tip = remaining > 0 ? 'Enter/Space 继续 (' + remaining + '条剩余)' : 'Enter/Space 结束';
    G.print('#888', tip, [W / 2 + 180, H / 2 + 156], { font: '10px monospace' });
}

function wrapText(text, maxLen) {
    const lines = [];
    let cur = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') { lines.push(cur); cur = ''; continue; }
        cur += ch;
        const w = cur.length + countCJK(cur);
        if (w >= maxLen) {
            lines.push(cur);
            cur = '';
        }
    }
    if (cur) lines.push(cur);
    return lines;
}

function countCJK(str) {
    let n = 0;
    for (const ch of str) {
        const c = ch.charCodeAt(0);
        if (c >= 0x4E00 || c >= 0x3000 && c <= 0x303F || c >= 0xFF00) n++;
    }
    return n;
}

// ===== 暂停菜单 =====
export function drawPause() {
    G.rectangle('fill', [0, 0, 0, 0.55], [0, 0, W, H]);
    G.print('#ffd700', '⏸ 游戏暂停', [W / 2 - 60, H / 2 - 120], { font: '24px monospace' });
    const items = ['🔹 继续游戏', '🎒 使用道具', '🏠 返回大厅'];
    const oy = H / 2 - 50;
    for (let i = 0; i < 3; i++) {
        const by = oy + i * 55;
        const sel = i === game.pauseMenuSel;
        G.rectangle('fill', sel ? [0.15, 0.12, 0.04, 0.9] : [0.08, 0.06, 0.03, 0.6], [W / 2 - 140, by, 280, 44]);
        if (sel) G.rectangle('line', '#ffd700', [W / 2 - 140, by, 280, 44], { lineWidth: 2 });
        G.print(sel ? '#fff' : '#ccc', items[i], [W / 2 - 100, by + 14], { font: '16px monospace' });
    }
    G.print('#888', 'ESC 返回游戏  ↑↓ 选择  Enter 确认', [W / 2 - 150, H / 2 + 80], { font: '11px monospace' });
}

// ===== 天劫界面 =====
export function drawTribulation() {
    G.clear('#0a0a0f');

    const shake = Math.sin(game.tribSurviveT * 20) * 2;
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', '#080610', [x + shake, y, 40, 40]);

    const cfg = TRIBULATION[game.CL.realm];
    const remaining = Math.max(0, game.tribTimer);
    G.print('#ff0', '⚡ 天 劫 ⚡', [W / 2 - 50, 20], { font: '22px monospace' });
    G.print('#f80', '撑过天劫方可突破至' + ({ '炼气': '筑基', '筑基': '结丹', '结丹': '元婴', '元婴': '化神' }[game.CL.realm] || '?'), [W / 2 - 120, 50], { font: '12px monospace' });
    G.print('#f00', '剩余 ' + remaining.toFixed(1) + 's', [W / 2 - 40, 72], { font: '14px monospace' });

    for (const b of game.tribBolts) {
        ln(b.x, b.y - 16, b.x, b.y + 4, '#ffdd44', 3);
        ln(b.x - 1, b.y - 12, b.x + 1, b.y - 4, '#ffaa00', 1);
        cir(b.x, b.y - 14, 2, '#fff');
        cir(b.x, b.y, 2, '#ffdd44');
    }

    for (const p of game.particles) G.circle('fill', [1, 1, 0.3, Math.max(0, p.life / 0.4)], [p.x, p.y], 1 + p.life * 4);

    drawHL(game.HL.x, game.HL.y);
    if (game.shieldT > 0) { G.circle('line', 'rgba(255,215,0,0.5)', [game.HL.x, game.HL.y], 18 + Math.sin(game.bottleGlowT * 8) * 2, { lineWidth: 2.5 }); }

    pix(0, H - 28, W, 28, '#0a0a14');
    G.print('#fff', '♥ ' + Math.round(game.hp) + '/' + maxHP(), [10, H - 22], { font: '10px monospace' });
    G.print('#f80', '法力:' + Math.round(game.mana), [140, H - 22], { font: '10px monospace' });
    G.print('#aaa', 'WASD 闪避天雷！', [W / 2 - 40, H - 22], { font: '10px monospace' });
}