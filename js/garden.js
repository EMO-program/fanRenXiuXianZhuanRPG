import { STAGES, HERBS, HLIST, PLOT_COSTS } from './config.js';
import { game } from './state.js';
import { maxHP, maxMana, doNtf, gainExp } from './utils.js';
import { enterEquipment } from './equipment.js';
import { enterInventory } from './inventory.js';

// ===== 灵田操作 =====
export function buyPlot(idx) {
    const p = game.cavePlots[idx]; if (p.unlocked) return;
    const cost = PLOT_COSTS[idx];
    if (game.spiritStones < cost) { doNtf('💎 灵石不足！需要 ' + cost + ' 灵石'); return; }
    game.spiritStones -= cost; p.unlocked = true;
    doNtf('🔓 开辟新灵田！消耗 ' + cost + ' 灵石');
}

export function harvestPlot(idx) {
    const p = game.cavePlots[idx]; if (!p.planted || !p.unlocked) return;
    const hb = HERBS[p.planted];
    if (p.gr < hb.gr) return;
    const y = hb.yield;
    game.inventory[y] = (game.inventory[y] || 0) + 1;
    doNtf('🌿 收获 ' + p.planted + '！获得 ' + y + '（已存入背包）');
    p.planted = null; p.gr = 0; p.watered = false;
}

export function waterPlot(idx) {
    const p = game.cavePlots[idx]; if (!p.planted || p.watered) return;
    if (p.waterCooldown > 0) { doNtf('⏳ ' + Math.ceil(p.waterCooldown) + '秒后可浇灌'); return; }
    const hb = HERBS[p.planted];
    p.gr++; p.watered = true; p.waterAnm = 1.0; p.waterCooldown = 300;
    doNtf('💧 浇灌 ' + p.planted + ' ' + p.gr + '/' + hb.gr);
    if (p.gr >= hb.gr) doNtf('✨ ' + p.planted + ' 已成熟！按 F 采集');
}

export function bottleWaterPlot(idx) {
    const p = game.cavePlots[idx]; if (!p.planted) return;
    const hb = HERBS[p.planted];
    if (p.gr >= hb.gr) { doNtf(p.planted + ' 已成熟，按 F 采集'); return; }
    if (game.bottleLiquid < 0.5) { doNtf('⚠ 灵液不足！当前' + Math.round(game.bottleLiquid * 100) + '%，需50%'); return; }
    game.bottleLiquid -= 0.5;
    p.gr = hb.gr; p.watered = true; p.waterAnm = 1.0;
    doNtf('🧪 掌天瓶浇灌 ' + p.planted + ' → 瞬间成熟！');
}

export function plantPlot(idx, herbName) {
    const p = game.cavePlots[idx]; if (p.planted) return;
    p.planted = herbName; p.gr = 0; p.watered = false;
    doNtf('🌱 种植：' + herbName);
}

// ===== 洞府模式 =====
export const CAVE_CHEST = { x: 680, y: 480 };
export const CAVE_PORTAL = { x: 400, y: 540 };

export function enterCave() {
    game.gameMode = 'cave'; game.waveReady = false;
    game.gHL.x = 400; game.gHL.y = 420; game.gHL.anim.st = 'idle';
    game.herbMenuOpen = false; game.herbMenuSel = 0; game.herbMenuPlot = -1;
    game.hp = Math.min(game.hp + maxHP() * 0.3, maxHP());
    game.mana = maxMana();
    doNtf('🏔 洞府休整...');
}

export function leaveCaveToBattle() {
    game.gameMode = 'battle'; game.waveReady = false; game.shieldT = 0; game.greatSwordT = 0; game.skillCDs = {};
    game.curS++; game.sWv = 0; game.totWv = 0; game.bSp = false; game.bDef = false; game.sClr = false;
    game.enemies = []; game.bullets = []; game.particles = []; game.effects = [];
    game.HL.x = 400; game.HL.y = TB + 180;
    game.hp = maxHP(); game.mana = maxMana();
    spawnWave();
    doNtf('→ 进入：' + (STAGES[game.curS] ? STAGES[game.curS].name : '终章'));
}

export function updateCave(dt, L) {
    for (const p of game.cavePlots) { if (p.waterAnm > 0) p.waterAnm = Math.max(0, p.waterAnm - dt * 1.5); if (p.waterCooldown > 0) p.waterCooldown = Math.max(0, p.waterCooldown - dt); }

    if (game.herbMenuOpen) {
        if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.herbMenuSel = Math.max(0, game.herbMenuSel - 1);
        if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.herbMenuSel = Math.min(HLIST.length - 1, game.herbMenuSel + 1);
        if (L.input.justPressed('menu_enter')) {
            plantPlot(game.herbMenuPlot, HLIST[game.herbMenuSel]);
            game.herbMenuOpen = false;
        }
        if (L.input.justPressed('menu_esc')) { game.herbMenuOpen = false; }
        return;
    }

    if (game.gameMode === 'equipment') return;

    if (L.input.justPressed('menu_esc')) { game.gameMode = 'hub'; game.hubSel = 0; return; }

    let dx = 0, dy = 0;
    if (L.input.isDown('left')) dx -= 1; if (L.input.isDown('right')) dx += 1;
    if (L.input.isDown('up')) dy -= 1; if (L.input.isDown('down')) dy += 1;
    game.gHL.mv = dx !== 0 || dy !== 0;
    if (game.gHL.mv) {
        if (dx && dy) { const n = Math.sqrt(dx * dx + dy * dy); dx /= n; dy /= n; }
        game.gHL.x += dx * game.gHL.spd * dt; game.gHL.y += dy * game.gHL.spd * dt;
        game.gHL.x = Math.max(20, Math.min(780, game.gHL.x));
        game.gHL.y = Math.max(30, Math.min(560, game.gHL.y));
        game.gHL.wA = Math.atan2(dy, dx);
        game.gHL.facing = Math.cos(game.gHL.wA);
    }
    const a = game.gHL.anim;
    if (game.gHL.mv) { a.st = 'walk'; if (a.tm > 0.12) { a.tm = 0; a.wf = (a.wf + 1) % 4; } }
    else { a.st = 'idle'; a.tm = 0; a.wf = 0; }
    a.tm += dt;

    function findNearPlot(unlockedOnly) {
        let nearest = -1, nDist = 60;
        for (let i = 0; i < game.cavePlots.length; i++) {
            const p = game.cavePlots[i];
            if (unlockedOnly && !p.unlocked) continue;
            const d = Math.hypot(game.gHL.x - (p.x + 35), game.gHL.y - (p.y + 27.5));
            if (d < nDist) { nDist = d; nearest = i; }
        }
        return nearest;
    }

    game.gInteract = Math.max(0, game.gInteract - dt);

    const chD = Math.hypot(game.gHL.x - CAVE_CHEST.x, game.gHL.y - CAVE_CHEST.y);
    const tbD = Math.hypot(game.gHL.x - 400, game.gHL.y - 280);

    if (L.input.justPressed('interact') && game.gInteract <= 0) {
        game.gInteract = 0.3;
        if (chD < 50) { enterEquipment(); return; }
        if (tbD < 50) { enterInventory(); return; }
        const nextLocked = game.cavePlots.findIndex(pp => !pp.unlocked);
        if (nextLocked >= 0) {
            const lp = game.cavePlots[nextLocked];
            const ld = Math.hypot(game.gHL.x - (lp.x + 35), game.gHL.y - (lp.y + 27.5));
            if (ld < 50) { buyPlot(nextLocked); }
            else {
                const nearest = findNearPlot(true);
                if (nearest >= 0) {
                    const p = game.cavePlots[nearest];
                    if (!p.planted) { game.herbMenuOpen = true; game.herbMenuSel = 0; game.herbMenuPlot = nearest; }
                    else { const hb = HERBS[p.planted]; if (p.gr >= hb.gr) { harvestPlot(nearest); } else if (!p.watered) { waterPlot(nearest); } else { doNtf(p.planted + ' 成长中 (' + p.gr + '/' + hb.gr + ')'); } }
                }
            }
        } else {
            const nearest = findNearPlot(true);
            if (nearest >= 0) {
                const p = game.cavePlots[nearest];
                if (!p.planted) { game.herbMenuOpen = true; game.herbMenuSel = 0; game.herbMenuPlot = nearest; }
                else { const hb = HERBS[p.planted]; if (p.gr >= hb.gr) { harvestPlot(nearest); } else if (!p.watered) { waterPlot(nearest); } else { doNtf(p.planted + ' 成长中 (' + p.gr + '/' + hb.gr + ')'); } }
            }
        }
    }
    if (L.input.justPressed('harvest') && game.gInteract <= 0) {
        game.gInteract = 0.3;
        const nearest = findNearPlot(true);
        if (nearest >= 0) {
            const p = game.cavePlots[nearest];
            if (p.planted) {
                const hb = HERBS[p.planted];
                if (p.gr >= hb.gr) { harvestPlot(nearest); }
                else { doNtf('⚠ ' + p.planted + ' 未成熟 (' + p.gr + '/' + hb.gr + ')，无法采集'); }
            }
        }
    }
    if (L.input.justPressed('bottle_w') && game.gInteract <= 0) {
        game.gInteract = 0.3;
        const nearest = findNearPlot(true);
        if (nearest >= 0) { bottleWaterPlot(nearest); }
    }
}
