import { L, G, W, H, TB } from './engine.js';
import { game } from './state.js';
import { STAGES, SKILLS, DIFFICULTIES, TECHNIQUES } from './config.js';
import { maxHP, maxMana, doNtf, hitFX, spawnSwordFX, cir } from './utils.js';
import { spawnWave, doMeleeHit, defeatBoss, goToHubAfterBoss } from './combat.js';
import { enterCave, updateCave } from './garden.js';
import { getEquipBonus } from './equipment.js';
import { drawHL, drawEn, drawFX, drawUI, drawCave, drawEquipment, drawInventory, drawTitle } from './draw.js';
import { drawOrbitSwords, drawShop, drawHub, drawTribulation, drawPause, drawEvent, drawDialogue } from './draw.js';
import { updateEquipment } from './equipment.js';
import { updateInventory, enterInventory } from './inventory.js';
import { saveToSlot, loadSlot, deleteSlot, getAllSlots, hasAnySave, applySave } from './save.js';
import { castSkill, updateSkillTimers, updateOrbitSwords, initOrbitSwords } from './skills.js';
import { updateShop, enterShop } from './shop.js';
import { updateTribulation, enterTribulation } from './tribulation.js';
import { learnTechnique, getTechBonus, onPlayerDealDamage, onEnemyKilled } from './techniques.js';
import { triggerRandomEvent, applyEventResult } from './events.js';

function startNewGame() {
    game.curS = 0; game.sWv = 0; game.totWv = 0; game.bSp = false; game.bDef = false; game.sClr = false; game.waveReady = false;
    game.shieldT = 0; game.greatSwordT = 0; game.skillCDs = {}; game.tribPending = false;
    game.enemies = []; game.bullets = []; game.particles = []; game.effects = []; game.orbitSwords = [];
    game.CL.realm = '炼气'; game.CL.stage = 1; game.CL.exp = 0; game.CL.expToNext = 60; game.CL.breakRdy = false;
    game.swCnt = 12; game.atkBuf = 0; game.psnCnt = 0; game.inventory = {}; game.bottleLiquid = 0; game.spiritStones = 0;
    game.clearedStages = []; game.techLvs = {}; game.bossTechs = []; game.completedEvents = [];
    for (const p of game.cavePlots) { p.planted = null; p.gr = 0; p.watered = false; p.waterCooldown = 0; p.unlocked = game.cavePlots.indexOf(p) < 2; }
    game.HL.x = 400; game.HL.y = TB + 180;
    game.gameMode = 'battle'; game.hp = maxHP(); game.mana = maxMana();
    spawnWave();
}

function startStage(idx) {
    game.curS = idx; game.sWv = 0; game.totWv = 0; game.bSp = false; game.bDef = false; game.sClr = false; game.waveReady = false;
    game.shieldT = 0; game.greatSwordT = 0; game.skillCDs = {};
    game.enemies = []; game.bullets = []; game.particles = []; game.effects = []; game.orbitSwords = [];
    game.HL.x = 400; game.HL.y = TB + 180;
    game.gameMode = 'battle'; game.hp = maxHP(); game.mana = maxMana();
    spawnWave();
}

L.load = () => {
    L.canvas.setMode([W, H]);
    L.canvas.displayCanvas.focus();
    const cvs = L.canvas.displayCanvas, cw = W, ch = H;
    function fitCanvas() {
        const ww = window.innerWidth, wh = window.innerHeight;
        const s = Math.min(ww / cw, wh / ch) * 0.96;
        cvs.style.width = (cw * s) + 'px';
        cvs.style.height = (ch * s) + 'px';
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    L.input.setAction('up', ['KeyW', 'ArrowUp']);
    L.input.setAction('down', ['KeyS', 'ArrowDown']);
    L.input.setAction('left', ['KeyA', 'ArrowLeft']);
    L.input.setAction('right', ['KeyD', 'ArrowRight']);
    L.input.setAction('shoot', ['MouseLeft']);
    L.input.setAction('restart', ['KeyR']);
    L.input.setAction('interact', ['KeyE', 'Space']);
    L.input.setAction('harvest', ['KeyF']);
    L.input.setAction('bottle_w', ['KeyQ']);
    L.input.setAction('garden_key', ['KeyG']);
    L.input.setAction('menu_esc', ['Escape']);
    L.input.setAction('menu_enter', ['Enter']);
    L.input.setAction('menu_up', ['ArrowUp']);
    L.input.setAction('menu_down', ['ArrowDown']);
    L.input.setAction('menu_left', ['ArrowLeft']);
    L.input.setAction('menu_right', ['ArrowRight']);

    L.input.setAction('skill1', ['Digit1']);
    L.input.setAction('skill2', ['Digit2']);
    L.input.setAction('skill3', ['Digit3']);
    L.input.setAction('skill4', ['Digit4']);

    game.hp = maxHP();
    game.mana = maxMana();
    game.gameMode = 'title';
    game.titleSel = 0;
};

L.update = (dt) => {
    game.ntfT = Math.max(0, game.ntfT - dt);
    game.bottleLiquid = Math.min(1, game.bottleLiquid + dt / 300);
    game.bottleGlowT += dt;

    if (game.gameMode === 'title') {
        if (game.titleMode === 'difficulty') {
            if (L.input.justPressed('menu_esc')) { game.titleMode = 'main'; game.titleSel = 0; }
            else if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.titleSel = Math.max(0, game.titleSel - 1);
            else if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.titleSel = Math.min(3, game.titleSel + 1);
            else if (L.input.justPressed('menu_enter')) { game.difficulty = DIFFICULTIES[game.titleSel]; startNewGame(); }
            return;
        }
        if (game.titleMode === 'slots') {
            if (L.input.justPressed('menu_esc')) { game.titleMode = 'main'; game.titleSel = 0; return; }
            if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.titleSel = Math.max(0, game.titleSel - 1);
            if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.titleSel = Math.min(9, game.titleSel + 1);
            if (L.input.justPressed('menu_enter')) {
                const d = loadSlot(game.titleSel);
                if (d) {
                    applySave(d);
                    game.gameMode = 'hub'; game.hubSel = 0; game.hubMode = 'main';
                    game.HL.x = 400; game.HL.y = 270;
                    game.gHL.x = 400; game.gHL.y = 420;
                } else {
                    game.titleMode = 'difficulty'; game.titleSel = 0;
                }
            }
            return;
        }
        if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.titleSel = Math.max(0, game.titleSel - 1);
        if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.titleSel = Math.min(1, game.titleSel + 1);
        if (L.input.justPressed('menu_enter')) {
            if (game.titleSel === 0) { game.titleMode = 'difficulty'; game.titleSel = 0; }
            else { game.titleMode = 'slots'; game.titleSel = 0; }
        }
        return;
    }

    if (game.gameMode === 'cave') {
        updateCave(dt, L);
        return;
    }
    if (game.gameMode === 'equipment') {
        updateEquipment(dt, L);
        return;
    }
    if (game.gameMode === 'inventory') {
        updateInventory(dt, L);
        return;
    }
    if (game.gameMode === 'shop') {
        updateShop(dt, L);
        return;
    }
    if (game.gameMode === 'tribulation') {
        updateTribulation(dt, L);
        return;
    }
    if (game.gameMode === 'event') {
        if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.eventSel = Math.max(0, game.eventSel - 1);
        if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.eventSel = Math.min(1, game.eventSel + 1);
        if (L.input.justPressed('menu_enter')) { applyEventResult(game.eventSel); }
        return;
    }

    if (game.gameMode === 'dialogue') {
        if (L.input.justPressed('menu_enter') || L.input.justPressed('interact')) {
            game.dialogueIdx++;
            if (game.dialogueIdx >= game.dialogueLines.length) {
                if (game.dialogueMode === 'pre_boss') {
                    const bp = STAGES[game.curS].boss;
                    game.enemies.push({ x: 400, y: TB + 60, size: bp.size, hp: bp.hp, maxHp: bp.hp, atk: bp.atk, alive: true, isBoss: true, name: bp.name, exp: bp.exp, tm: 0, tm2: 0, ph: 1, phDone: false });
                    game.gameMode = 'battle';
                    doNtf('⚠ BOSS降临：' + bp.name + '！');
                } else if (game.dialogueMode === 'post_boss') {
                    goToHubAfterBoss();
                }
                game.dialogueLines = [];
                game.dialogueMode = '';
            }
        }
        return;
    }

    if (game.gameMode === 'hub') {
        if (game.tribPending) { game.tribPending = false; enterTribulation(); return; }
        if (game.hubMode === 'stages') {
            if (L.input.justPressed('menu_esc')) { game.hubMode = 'main'; game.hubSel = 0; return; }
            const cleared = game.clearedStages || [];
            const maxCleared = cleared.length > 0 ? Math.max(...cleared) : -1;
            if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.hubSel = Math.max(0, game.hubSel - 1);
            if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.hubSel = Math.min(STAGES.length - 1, game.hubSel + 1);
            if (L.input.justPressed('menu_enter')) {
                const idx = game.hubSel;
                const isUnlocked = cleared.includes(idx) || idx <= maxCleared + 1;
                if (isUnlocked) startStage(idx);
            }
            return;
        }
        if (game.hubMode === 'techniques') {
            if (L.input.justPressed('menu_esc')) { game.hubMode = 'main'; game.hubSel = 0; return; }
            const baseList = TECHNIQUES.filter(t => t.type === 'base');
            const ownedBosses = TECHNIQUES.filter(t => t.type === 'boss' && game.bossTechs && game.bossTechs.includes(t.id));
            const totalItems = baseList.length + ownedBosses.length;
            if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.hubSel = Math.max(0, game.hubSel - 1);
            if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.hubSel = Math.min(totalItems - 1, game.hubSel + 1);
            if (L.input.justPressed('menu_enter')) {
                const allTechs = [...baseList, ...ownedBosses];
                const sel = allTechs[game.hubSel];
                if (sel) { const idx = TECHNIQUES.indexOf(sel); learnTechnique(idx); }
            }
            return;
        }
        if (game.hubMode === 'save') {
            if (game.saveConfirm >= 0) {
                if (L.input.justPressed('menu_enter')) { const slotIdx = game.saveConfirm; saveToSlot(slotIdx); game.saveConfirm = -1; doNtf('💾 存档至槽' + (slotIdx + 1) + '！'); }
                if (L.input.justPressed('menu_esc') || L.input.justPressed('menu_left')) { game.saveConfirm = -1; }
                return;
            }
            if (L.input.justPressed('menu_esc')) { game.hubMode = 'main'; game.hubSel = 4; game.saveConfirm = -1; return; }
            if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.hubSel = Math.max(0, game.hubSel - 1);
            if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.hubSel = Math.min(9, game.hubSel + 1);
            if (L.input.justPressed('menu_enter')) {
                const s = getAllSlots()[game.hubSel];
                if (s.data) {
                    game.saveConfirm = game.hubSel;
                } else {
                    saveToSlot(game.hubSel);
                    doNtf('💾 存档至槽' + (game.hubSel + 1) + '！');
                }
            }
            return;
        }
        if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.hubSel = Math.max(0, game.hubSel - 1);
        if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.hubSel = Math.min(4, game.hubSel + 1);
        if (L.input.justPressed('menu_enter')) {
            if (game.hubSel === 0) { enterCave(); }
            else if (game.hubSel === 1) { enterShop('hub'); }
            else if (game.hubSel === 2) { game.hubMode = 'stages'; game.hubSel = 0; }
            else if (game.hubSel === 3) { game.hubMode = 'techniques'; game.hubSel = 0; }
            else { game.hubMode = 'save'; game.hubSel = 0; game.saveConfirm = -1; }
        }
        return;
    }

    if (game.gameOver) {
        if (L.input.justPressed('restart')) {
            game.hp = maxHP(); game.mana = maxMana(); game.HL.x = 400; game.HL.y = TB + 180;
            game.gameOver = false; game.curS = 0; game.sWv = 0; game.totWv = 0; game.bSp = false; game.bDef = false; game.sClr = false; game.waveReady = false;
            game.enemies = []; game.bullets = []; game.particles = []; game.effects = [];
            game.CL.realm = '炼气'; game.CL.stage = 1; game.CL.exp = 0; game.CL.expToNext = 60; game.CL.breakRdy = false;
            game.swCnt = 12; game.atkBuf = 0; game.psnCnt = 0; game.shieldT = 0; game.greatSwordT = 0; game.skillCDs = {}; game.tribPending = false; game.inventory = {}; game.bottleLiquid = 0; game.spiritStones = 0; game.techLvs = {}; game.bossTechs = []; game.completedEvents = [];
            for (const p of game.cavePlots) { p.planted = null; p.gr = 0; p.watered = false; p.waterCooldown = 0; p.unlocked = game.cavePlots.indexOf(p) < 2; }
            spawnWave();
        } else if (L.input.justPressed('garden_key')) {
            game.gameOver = false; game.hp = 1; game.mana = maxMana();
            game.diedEnterCave = true;
            game.gameMode = 'hub'; game.hubSel = 0;
        }
        return;
    }

    const a = game.HL.anim;
    const eqDef = getEquipBonus().def;

    if (L.input.justPressed('menu_esc')) {
        game.paused = true;
        game.pauseMenuSel = 0;
        return;
    }

    if (game.paused) {
        if (L.input.justPressed('menu_up') || L.input.justPressed('up')) game.pauseMenuSel = Math.max(0, game.pauseMenuSel - 1);
        if (L.input.justPressed('menu_down') || L.input.justPressed('down')) game.pauseMenuSel = Math.min(2, game.pauseMenuSel + 1);
        if (L.input.justPressed('menu_enter')) {
            if (game.pauseMenuSel === 0) { game.paused = false; }
            else if (game.pauseMenuSel === 1) { game.paused = false; enterInventory('battle'); }
            else { game.paused = false; game.gameMode = 'hub'; game.hubSel = 0; }
        }
        if (L.input.justPressed('menu_esc')) { game.paused = false; }
        return;
    }

    let dx = 0, dy = 0;
    if (L.input.isDown('left')) dx -= 1;
    if (L.input.isDown('right')) dx += 1;
    if (L.input.isDown('up')) dy -= 1;
    if (L.input.isDown('down')) dy += 1;
    const tb = getTechBonus();
    game.HL.mv = dx !== 0 || dy !== 0;
    if (game.HL.mv) {
        if (dx && dy) { const n = Math.sqrt(dx * dx + dy * dy); dx /= n; dy /= n; }
        game.HL.x += dx * game.HL.spd * tb.spdMul * dt; game.HL.y += dy * game.HL.spd * tb.spdMul * dt;
        game.HL.x = Math.max(16, Math.min(W - 16, game.HL.x));
        game.HL.y = Math.max(TB + 30, Math.min(H - 50, game.HL.y));
        game.HL.wA = Math.atan2(dy, dx);
    }
    const [mx, my] = L.mouse.getPosition();
    game.HL.fA = Math.atan2(my - game.HL.y, mx - game.HL.x);
    a.tm += dt; a.cd = Math.max(0, a.cd - dt);
    game.mana = Math.min(maxMana(), game.mana + 3 * getEquipBonus().manaRegen * (1 + tb.manaMul) * dt);
    if (tb.regen > 0) game.hp = Math.min(maxHP(), game.hp + tb.regen * dt);
    updateSkillTimers(dt);
    updateOrbitSwords(dt);
    initOrbitSwords();

    game.atkBuf = Math.max(0, game.atkBuf - dt);
    if (game.psnCnt > 0) {
        game.psnCnt -= dt;
        for (const e of game.enemies) if (e.alive) { e.hp -= 4 * dt; if (e.hp <= 0) { e.alive = false; hitFX(e); } }
    }
    if (game.techLvs['moYiPoison']) {
        const auraDmg = 4;
        for (const e of game.enemies) {
            if (!e.alive) continue;
            if (Math.hypot(game.HL.x - e.x, game.HL.y - e.y) < 80) {
                e.hp -= auraDmg * dt;
                if (e.hp <= 0) { e.alive = false; hitFX(e); game.spiritStones += 1 + Math.floor(Math.random() * 2); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); }
            }
        }
    }

    const atkDr = 0.28;
    if (a.st === 'attack') {
        a.atkT += dt;
        if (a.atkT >= atkDr) { a.st = game.HL.mv ? 'walk' : 'idle'; a.atkT = 0; a.hit = false; }
    } else if (game.HL.mv) {
        a.st = 'walk';
        if (a.tm > 0.12) { a.tm = 0; a.wf = (a.wf + 1) % 4; }
    } else {
        a.st = 'idle'; a.tm = 0; a.wf = 0;
    }

    if (L.input.isDown('shoot') && a.cd <= 0) {
        if (game.mana < 5) { doNtf('法力不足！'); a.cd = 0.2; }
        else {
            a.st = 'attack'; a.atkT = 0; a.cd = 0.45; a.hit = false; game.mana -= 5;
            const sd = 130; a.swS = (game.HL.fA * 180 / Math.PI) - sd / 2; a.swL = sd;
        }
    }
    if (L.input.justPressed('skill1')) castSkill('fireball');
    if (L.input.justPressed('skill2')) castSkill('flyingSwords');
    if (L.input.justPressed('skill3')) castSkill('shield');
    if (L.input.justPressed('skill4')) castSkill('greatSword');
    if (a.st === 'attack' && !a.hit && a.atkT >= 0.07) doMeleeHit();

    if (game.sClr && L.input.justPressed('restart')) { game.gameMode = 'hub'; game.hubSel = 0; }

    for (const e of game.enemies) {
        if (!e.alive) continue;
        const edx = game.HL.x - e.x, edy = game.HL.y - e.y, ed = Math.hypot(edx, edy);
        e.tm = (e.tm || 0) + dt;

        if (e.isBoss) {
            if (ed > 0) { const spd = e.spd || 30; e.x += edx / ed * spd * dt; e.y += edy / ed * spd * dt; }
            const hpPct = e.hp / e.maxHp;
            if (e.tm > (hpPct < 0.5 ? 0.4 : 1.2)) {
                e.tm = 0;
                if (hpPct < 0.3) {
                    for (let j = 0; j < 8; j++) {
                        const aa = j * Math.PI * 2 / 8;
                        game.bullets.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 150, vy: Math.sin(aa) * 150, life: 1.8, type: 'bossBullet' });
                    }
                } else if (hpPct < 0.5) {
                    const ba = Math.atan2(game.HL.y - e.y, game.HL.x - e.x);
                    for (let j = -1; j <= 1; j++) {
                        const aa = ba + j * 0.3;
                        game.bullets.push({ x: e.x, y: e.y, vx: Math.cos(aa) * 200, vy: Math.sin(aa) * 200, life: 1.5, type: 'bossBullet' });
                    }
                } else {
                    const ba = Math.atan2(game.HL.y - e.y, game.HL.x - e.x);
                    game.bullets.push({ x: e.x, y: e.y, vx: Math.cos(ba) * 180, vy: Math.sin(ba) * 180, life: 1.5, type: 'bossBullet' });
                }
            }
            if (Math.hypot(game.HL.x - e.x, game.HL.y - e.y) < e.size + 12 && game.HL.invT <= 0) {
                if (game.shieldT <= 0) { game.hp -= Math.max(1, 8 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
                hitFX({ x: game.HL.x, y: game.HL.y });
            }
            continue;
        }

        if (e.type === '弓手') {
            e.atkCd = Math.max(0, (e.atkCd || 0) - dt);
            if (ed > 120) {
                if (ed > 0) { e.x += edx / ed * e.spd * dt; e.y += edy / ed * e.spd * dt; }
            }
            if (e.atkCd <= 0 && ed < 400) {
                e.atkCd = 1.5 + Math.random() * 0.5;
                const ba = Math.atan2(game.HL.y - e.y, game.HL.x - e.x);
                game.bullets.push({ x: e.x, y: e.y, vx: Math.cos(ba) * 200, vy: Math.sin(ba) * 200, life: 2.5, type: 'arrow' });
            }
            if (ed < e.size + 10 && game.HL.invT <= 0) {
                if (game.shieldT <= 0) { game.hp -= Math.max(1, 3 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
                hitFX({ x: game.HL.x, y: game.HL.y });
            }
            continue;
        }

        if (e.type === '冲锋') {
            e.chCd = Math.max(0, (e.chCd || 0) - dt);
            if (!e.charging && e.chCd <= 0 && ed < 200) {
                e.charging = true; e.chT = 0; e.chSpd = 300 + game.sWv * 30;
                e.chDx = edx / ed; e.chDy = edy / ed;
            }
            if (e.charging) {
                e.chT += dt;
                e.x += e.chDx * e.chSpd * dt; e.y += e.chDy * e.chSpd * dt;
                if (e.chT > 0.5) { e.charging = false; e.chCd = 2; }
                if (e.x < 10 || e.x > W - 10 || e.y < TB + 10 || e.y > H - 10) { e.charging = false; e.chCd = 2; }
            } else if (ed > 0) {
                e.x += edx / ed * e.spd * dt; e.y += edy / ed * e.spd * dt;
            }
            if (ed < e.size + 10 && game.HL.invT <= 0) {
                if (game.shieldT <= 0) { game.hp -= Math.max(1, 7 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
                hitFX({ x: game.HL.x, y: game.HL.y });
                if (e.charging) { e.charging = false; e.chCd = 2; }
            }
            continue;
        }

        if (e.type === '召唤师') {
            e.sumCd = Math.max(0, (e.sumCd || 0) - dt);
            if (ed > 200) {
                if (ed > 0) { e.x += edx / ed * e.spd * dt; e.y += edy / ed * e.spd * dt; }
            } else if (ed < 100) {
                if (ed > 0) { e.x -= edx / ed * e.spd * dt; e.y -= edy / ed * e.spd * dt; }
            }
            if (e.sumCd <= 0) {
                e.sumCd = 4 + Math.random() * 2;
                const ax = e.x + (Math.random() - 0.5) * 60, ay = e.y + (Math.random() - 0.5) * 40;
                game.enemies.push({ x: ax, y: ay, type: '普通', size: 6, hp: 2, alive: true, spd: 50 + game.sWv * 10, tm: 0 });
            }
            if (ed < e.size + 10 && game.HL.invT <= 0) {
                if (game.shieldT <= 0) { game.hp -= Math.max(1, 4 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
                hitFX({ x: game.HL.x, y: game.HL.y });
            }
            continue;
        }

        if (ed > 0) { const spd = e.spd || 40; e.x += edx / ed * spd * dt; e.y += edy / ed * spd * dt; }
        if (Math.hypot(game.HL.x - e.x, game.HL.y - e.y) < e.size + 10 && game.HL.invT <= 0) {
            if (game.shieldT <= 0) { game.hp -= Math.max(1, 5 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
            hitFX({ x: game.HL.x, y: game.HL.y });
            for (let i = 0; i < 3; i++) game.particles.push({ x: game.HL.x, y: game.HL.y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, life: 0.3 });
        }
    }
    game.HL.invT = Math.max(0, game.HL.invT - dt);
    const aliveEnemies = game.enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 && !game.sClr) {
        if (game.bSp && game.bDef) { game.sClr = true; }
        else { spawnWave(); }
    }

    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const b = game.bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        if (b.type === 'fireball' && (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30)) {
            for (const ee of game.enemies) {
                if (!ee.alive) continue;
                if (Math.hypot(b.x - ee.x, b.y - ee.y) < 30) {
                    ee.hp -= 10; hitFX({ x: ee.x, y: ee.y });
                    if (ee.hp <= 0) { if (ee.isBoss) defeatBoss(ee); else { ee.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                }
            }
            for (let j = 0; j < 6; j++) {
                const aa = Math.random() * Math.PI * 2;
                game.particles.push({ x: b.x, y: b.y, vx: Math.cos(aa) * (20 + Math.random() * 50), vy: Math.sin(aa) * (20 + Math.random() * 50), life: 0.35 });
            }
            game.effects.push({ x: b.x, y: b.y, tp: 'flare', life: 0.3, ml: 0.3, cl: '#ff8040', sz: 18 });
            game.bullets.splice(i, 1); continue;
        }
        if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) { game.bullets.splice(i, 1); continue; }
        if (b.type === 'fireball') {
            let hit = false;
            for (const e of game.enemies) {
                if (!e.alive) continue;
                if (Math.hypot(b.x - e.x, b.y - e.y) < e.size + 8) {
                    e.hp -= b.dmg || 30; hitFX({ x: e.x, y: e.y }); onPlayerDealDamage(b.dmg || 30);
                    if (e.hp <= 0) { if (e.isBoss) defeatBoss(e); else { e.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                    for (const ee of game.enemies) {
                        if (!ee.alive || ee === e) continue;
                        if (Math.hypot(b.x - ee.x, b.y - ee.y) < 50) {
                            ee.hp -= 10; hitFX({ x: ee.x, y: ee.y });
                            if (ee.hp <= 0) { if (ee.isBoss) defeatBoss(ee); else { ee.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                        }
                    }
                    for (let j = 0; j < 10; j++) {
                        const aa = Math.random() * Math.PI * 2;
                        game.particles.push({ x: b.x, y: b.y, vx: Math.cos(aa) * (40 + Math.random() * 80), vy: Math.sin(aa) * (40 + Math.random() * 80), life: 0.5 });
                    }
                    game.effects.push({ x: b.x, y: b.y, tp: 'explosion', life: 0.4, ml: 0.4, cl: '#ff6030', sz: 30 });
                    hit = true; break;
                }
            }
            if (hit) game.bullets.splice(i, 1);
            continue;
        }
        if (b.type === 'swordBeam') {
            let hit = false;
            for (const e of game.enemies) {
                if (!e.alive) continue;
                if (Math.hypot(b.x - e.x, b.y - e.y) < e.size + 8) {
                    e.hp -= b.dmg || 20; hitFX({ x: e.x, y: e.y }); onPlayerDealDamage(b.dmg || 20);
                    if (e.hp <= 0) { if (e.isBoss) defeatBoss(e); else { e.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                    hit = true; break;
                }
            }
            if (hit) game.bullets.splice(i, 1);
            continue;
        }
        if (Math.hypot(b.x - game.HL.x, b.y - game.HL.y) < 14 && game.HL.invT <= 0) {
            if (game.shieldT <= 0) { game.hp -= Math.max(1, 8 - eqDef - tb.flatDef); game.HL.invT = 0.5; }
            game.bullets.splice(i, 1); hitFX({ x: game.HL.x, y: game.HL.y });
        }
    }
    if (game.hp <= 0) { game.gameOver = true; doNtf('💀 韩立陨落...按 G 进入大厅'); }

    for (let i = game.particles.length - 1; i >= 0; i--) {
        game.particles[i].x += game.particles[i].vx * dt; game.particles[i].y += game.particles[i].vy * dt; game.particles[i].life -= dt;
        if (game.particles[i].life <= 0) game.particles.splice(i, 1);
    }
    for (let i = game.effects.length - 1; i >= 0; i--) {
        game.effects[i].x += game.effects[i].vx ? game.effects[i].vx * dt : 0;
        game.effects[i].y += game.effects[i].vy ? game.effects[i].vy * dt : 0;
        game.effects[i].life -= dt;
        if (game.effects[i].life <= 0) game.effects.splice(i, 1);
    }
};

L.draw = () => {
    if (game.gameMode === 'title') { drawTitle(); return; }
    if (game.gameMode === 'cave') { drawCave(); return; }
    if (game.gameMode === 'equipment') { drawEquipment(); return; }
    if (game.gameMode === 'inventory') { drawInventory(); return; }
    if (game.gameMode === 'shop') { drawShop(); return; }
    if (game.gameMode === 'hub') { drawHub(); return; }
    if (game.gameMode === 'tribulation') { drawTribulation(); return; }
    if (game.gameMode === 'event') { drawEvent(); return; }

    const sd = STAGES[game.curS];
    G.clear(sd.env);
    for (let x = 0; x < W; x += 40) for (let y = 0; y < H; y += 40) if ((x / 40 + y / 40) % 2 === 0) G.rectangle('fill', sd.env2, [x, y, 40, 40]);
    for (const p of game.particles) G.circle('fill', [1, 0.3, 0.1, Math.max(0, p.life / 0.4)], [p.x, p.y], 1 + p.life * 4);
    for (const b of game.bullets) {
        if (b.type === 'fireball') { cir(b.x, b.y, 6, '#ff6030'); cir(b.x, b.y, 3, '#ffa040'); }
        else if (b.type === 'swordBeam') { G.circle('line', '#40c060', [b.x, b.y], 6, { lineWidth: 1.5 }); cir(b.x, b.y, 2, '#80ff80'); }
        else if (b.type === 'arrow') { G.circle('line', '#c04020', [b.x, b.y], 3, { lineWidth: 1 }); cir(b.x, b.y, 1.5, '#ff8040'); }
        else if (b.type === 'bossBullet') { G.circle('line', '#ff00ff', [b.x, b.y], 5, { lineWidth: 2 }); cir(b.x, b.y, 2, '#ff80ff'); }
        else { cir(b.x, b.y, 4, '#ff4040'); cir(b.x, b.y, 2, '#ff8080'); }
    }
    for (const e of game.enemies) { if (!e.alive) continue; drawEn(e); }
    drawFX();
    drawOrbitSwords();
    if (!game.gameOver) drawHL(game.HL.x, game.HL.y);
    drawUI();
    if (game.shieldT > 0) { G.circle('line', 'rgba(255,215,0,0.5)', [game.HL.x, game.HL.y], 18 + Math.sin(game.bottleGlowT * 8) * 2, { lineWidth: 2.5 }); }
    if (game.greatSwordT > 0) { G.circle('line', 'rgba(255,128,64,0.45)', [game.HL.x, game.HL.y], 28 + Math.sin(game.bottleGlowT * 5) * 3, { lineWidth: 2 }); }
    let skTxt = '';
    for (const sk of SKILLS) {
        const cd = game.skillCDs[sk.id] || 0;
        const cl = cd > 0 ? '#f66' : game.mana >= sk.mana ? '#0f0' : '#666';
        skTxt += sk.name + '[' + sk.keys[0].replace('Digit','') + '] ';
        if (cd > 0) skTxt += cd.toFixed(1) + 's ';
    }
    G.print('#aaa', skTxt, [W / 2 - 180, H - 48], { font: '10px monospace' });
    if (game.gameOver) {
        G.rectangle('fill', [0, 0, 0, 0.6], [0, 0, W, H]);
        G.print('#f00', '💀 韩立陨落', [W / 2 - 60, H / 2 - 30], { font: '24px monospace' });
        G.print('#fff', '按 R 重新开始', [W / 2 - 70, H / 2], { font: '14px monospace' });
        G.print('#6af', '按 G 进入大厅', [W / 2 - 70, H / 2 + 24], { font: '14px monospace' });
    }
    if (game.paused) { drawPause(); }
    if (game.gameMode === 'dialogue') { drawDialogue(); }
};

await L.start();
