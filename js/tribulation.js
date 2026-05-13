import { TRIBULATION } from './config.js';
import { game } from './state.js';
import { W, H, TB } from './engine.js';
import { maxHP, maxMana, doNtf, gainExp, hitFX } from './utils.js';

export function enterTribulation() {
    const cfg = TRIBULATION[game.CL.realm];
    if (!cfg) { doNtf('⚠ 无法触发天劫'); return; }
    game.gameMode = 'tribulation';
    game.tribTimer = cfg.duration;
    game.tribBoltCD = 0;
    game.tribBolts = [];
    game.tribSurviveT = 0;
    game.enemies = []; game.bullets = []; game.particles = []; game.effects = [];
    game.HL.x = W / 2; game.HL.y = H - 80;
    game.waveReady = false;
    game.shieldT = 0; game.skillCDs = {};
    doNtf('⚡ 天劫降临！撑过' + cfg.duration + '秒！');
}

export function updateTribulation(dt, L) {
    const cfg = TRIBULATION[game.CL.realm];
    if (!cfg) { game.gameMode = 'battle'; return; }

    let dx = 0, dy = 0;
    if (L.input.isDown('left')) dx -= 1;
    if (L.input.isDown('right')) dx += 1;
    if (L.input.isDown('up')) dy -= 1;
    if (L.input.isDown('down')) dy += 1;
    game.HL.mv = dx !== 0 || dy !== 0;
    if (game.HL.mv) {
        if (dx && dy) { const n = Math.sqrt(dx * dx + dy * dy); dx /= n; dy /= n; }
        game.HL.x += dx * game.HL.spd * dt; game.HL.y += dy * game.HL.spd * dt;
        game.HL.x = Math.max(16, Math.min(W - 16, game.HL.x));
        game.HL.y = Math.max(TB + 30, Math.min(H - 50, game.HL.y));
    }
    game.HL.invT = Math.max(0, game.HL.invT - dt);
    game.shieldT = Math.max(0, game.shieldT - dt);

    game.tribTimer -= dt;
    game.tribSurviveT += dt;

    if (game.tribTimer <= 0) {
        completeTribulation();
        return;
    }

    game.tribBoltCD = Math.max(0, game.tribBoltCD - dt);
    if (game.tribBoltCD <= 0) {
        game.tribBoltCD = cfg.boltGap * (0.7 + Math.random() * 0.6);
        for (let i = 0; i < cfg.boltsPer; i++) {
            const tx = 40 + Math.random() * (W - 80);
            game.tribBolts.push({
                x: tx, y: -10,
                life: 0.8, dmg: cfg.boltDmg, spd: cfg.boltSpd,
                flash: 0, warned: false
            });
        }
    }

    for (let i = game.tribBolts.length - 1; i >= 0; i--) {
        const b = game.tribBolts[i];
        b.y += b.spd * dt;
        b.life -= dt;
        if (!b.warned && b.y > 10) {
            b.warned = true;
            game.effects.push({ x: b.x, y: b.y + 10, tp: 'boltWarn', life: 0.2, ml: 0.2, cl: '#ffdd00', sz: 8 });
        }
        if (b.y > H + 10 || b.life <= 0) {
            game.tribBolts.splice(i, 1);
            continue;
        }
        if (Math.hypot(b.x - game.HL.x, b.y - game.HL.y) < 14 && game.HL.invT <= 0) {
            if (game.shieldT <= 0) {
                game.hp -= b.dmg;
                game.HL.invT = 0.3;
            }
            hitFX({ x: game.HL.x, y: game.HL.y });
            for (let j = 0; j < 6; j++) {
                const aa = Math.random() * Math.PI * 2;
                game.particles.push({ x: game.HL.x, y: game.HL.y, vx: Math.cos(aa) * (60 + Math.random() * 100), vy: Math.sin(aa) * (30 + Math.random() * 80), life: 0.3 });
            }
            game.particles.push({ x: b.x, y: b.y, vx: 0, vy: 0, life: 0.5 });
            game.tribBolts.splice(i, 1);
        }
    }

    if (game.hp <= 0) { game.hp = 0; failTribulation(); }
}

function completeTribulation() {
    const nextRealm = { '炼气': '筑基', '筑基': '结丹', '结丹': '元婴', '元婴': '化神' }[game.CL.realm];
    if (!nextRealm) { game.gameMode = 'battle'; return; }
    game.CL.breakRdy = false;
    game.CL.realm = nextRealm;
    game.CL.stage = 1;
    game.CL.exp = 0;
    game.CL.expToNext = Math.round(game.CL.expToNext * 1.8);
    game.hp = maxHP(); game.mana = maxMana();
    game.gameMode = 'battle'; game.sClr = false; game.waveReady = false; game.bSp = false; game.bDef = false;
    game.tribBolts = [];
    if (nextRealm === '筑基') game.swCnt = 12;
    else if (nextRealm === '结丹') game.swCnt = 24;
    else if (nextRealm === '元婴') game.swCnt = 48;
    else if (nextRealm === '化神') game.swCnt = 72;
    doNtf('⚡ 渡过天劫！踏入' + nextRealm + '！');
}

function failTribulation() {
    game.CL.breakRdy = false;
    game.CL.exp = Math.max(0, game.CL.expToNext - 1);
    game.hp = Math.round(maxHP() * 0.2);
    game.mana = maxMana();
    game.gameMode = 'battle'; game.sClr = false; game.waveReady = false; game.bSp = false; game.bDef = false;
    game.tribBolts = [];
    doNtf('💀 天劫失败！境界突破未果...可再尝试');
}
