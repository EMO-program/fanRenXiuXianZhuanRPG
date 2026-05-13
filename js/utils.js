import { REALMS, RNAMES, STAGES, rsName, rsStats, DIFF_MULT } from './config.js';
import { game } from './state.js';
import { G, S as SC, TB } from './engine.js';
import { getEquipBonus } from './equipment.js';
import { getTechBonus } from './techniques.js';

// ===== 画笔基础 =====
export function pix(x, y, w, h, c) { G.rectangle('fill', c, [x | 0, y | 0, w, h]); }
export function ln(x1, y1, x2, y2, c, w) { G.line(c, [[x1, y1], [x2, y2]], { lineWidth: w || 1 }); }
export function cir(x, y, r, c) { G.circle('fill', c, [x, y], r); }
export function cs(c, a) { return c.replace(')', ',' + a + ')').replace('rgb', 'rgba'); }

// ===== 状态计算 =====
export function maxHP() { const b = getEquipBonus(); const mult = DIFF_MULT[game.difficulty].playerHpMul; const tb = getTechBonus(); return Math.round((rsStats(game.CL.realm, game.CL.stage).hp + b.hp) * b.hpMul * mult * tb.hpMul); }
export function maxMana() { return Math.round(rsStats(game.CL.realm, game.CL.stage).mana * DIFF_MULT[game.difficulty].playerManaMul); }
export function atkBase() { return Math.round((rsStats(game.CL.realm, game.CL.stage).atk + getEquipBonus().atk) * DIFF_MULT[game.difficulty].playerAtkMul); }
export function aMult() { const tb = getTechBonus(); return (1 + (game.atkBuf > 0 ? 0.5 : 0)) * tb.dmgMul; }
export function doNtf(m) { game.ntf = m; game.ntfT = 2.5; }

export function gainExp(amt) {
    game.CL.exp += amt;
    while (game.CL.exp >= game.CL.expToNext) {
        game.CL.exp -= game.CL.expToNext;
        const rd = REALMS[game.CL.realm];
        if (game.CL.stage >= rd.maxS) {
            const i = RNAMES.indexOf(game.CL.realm);
            if (i >= RNAMES.length - 1) { game.CL.exp = 0; doNtf('已达化神巅峰！'); break; }
            if (!game.CL.breakRdy) { game.CL.breakRdy = true; game.CL.exp = game.CL.expToNext - 1; doNtf('🔒 瓶颈！击败当前副本BOSS完成突破'); break; }
            game.tribPending = true; game.CL.exp = 0;
            doNtf('⚡ 瓶颈松动...天劫将至！'); break;
        } else {
            game.CL.stage++; game.CL.expToNext = Math.round(game.CL.expToNext * 1.25);
            doNtf('↑ ' + rsName(game.CL.realm, game.CL.stage));
        }
    }
}

// ===== 数学工具 =====
export function angleDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

export function hitFX(e) {
    for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2, sp = 35 + Math.random() * 70;
        game.particles.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 });
    }
}

export function spawnSwordFX(px, py, ang, hD, len) {
    const cc = '#40e060';
    for (let i = 0; i < 12; i++) {
        const t = (Math.random() - 0.5) * 2 * hD, a = ang + t * Math.PI / 180;
        game.effects.push({ x: px, y: py, tp: 'sP', life: 0.4, ml: 0.4, vx: Math.cos(a) * (18 + Math.random() * 55), vy: Math.sin(a) * (18 + Math.random() * 55), cl: cc, sz: 1 + Math.random() * 3 });
    }
}
