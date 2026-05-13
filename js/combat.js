import { STAGES, DIFF_MULT, TECHNIQUES } from './config.js';
import { game } from './state.js';
import { W, H, TB } from './engine.js';
import { atkBase, aMult, doNtf, gainExp, angleDiff, hitFX, spawnSwordFX, maxHP } from './utils.js';
import { onPlayerDealDamage, onEnemyKilled } from './techniques.js';
import { triggerRandomEvent } from './events.js';

export function spawnWave() {
    if (game.sClr) return;
    const sd = STAGES[game.curS];
    if (game.sWv >= sd.waves) { if (!game.bSp) spawnBoss(); return; }
    const cnt = 3 + game.sWv * 2;
    const types = ['普通'];
    if (game.sWv >= 2) types.push('弓手');
    if (game.sWv >= 3) types.push('冲锋');
    if (game.sWv >= 5) types.push('召唤师');
    for (let i = 0; i < cnt; i++) {
        let x, y;
        do { x = 40 + Math.random() * (W - 80); y = TB + 30 + Math.random() * (H - TB - 100); }
        while (Math.hypot(x - game.HL.x, y - game.HL.y) < 110);
        const tp = types[Math.floor(Math.random() * types.length)];
        const dm = DIFF_MULT[game.difficulty];
        const enemy = { x, y, type: tp, alive: true, tm: Math.random() * 2 };
        if (tp === '弓手') {
            enemy.size = 9; enemy.hp = Math.round((2 + game.sWv) * dm.enemyHpMul); enemy.spd = Math.round((10 + game.sWv * 5) * dm.enemySpdMul); enemy.atkCd = 0;
        } else if (tp === '冲锋') {
            enemy.size = 11; enemy.hp = Math.round((3 + game.sWv * 2) * dm.enemyHpMul); enemy.spd = Math.round((60 + game.sWv * 20) * dm.enemySpdMul); enemy.charging = false; enemy.chCd = 0;
        } else if (tp === '召唤师') {
            enemy.size = 10; enemy.hp = Math.round((4 + game.sWv * 2) * dm.enemyHpMul); enemy.spd = Math.round((8 + game.sWv * 3) * dm.enemySpdMul); enemy.sumCd = 0;
        } else {
            enemy.size = 8 + Math.random() * 4; enemy.hp = Math.round((1 + game.sWv) * dm.enemyHpMul); enemy.spd = Math.round((25 + game.sWv * 16) * dm.enemySpdMul);
        }
        game.enemies.push(enemy);
    }
    game.sWv++; game.totWv++; doNtf('第' + game.sWv + '波敌人来袭！');
}

export function spawnBoss() {
    if (game.bSp || game.bDef) return;
    game.bSp = true;
    const bp = STAGES[game.curS].boss;
    if (bp.pre && bp.pre.length > 0) {
        game.dialogueLines = bp.pre;
        game.dialogueIdx = 0;
        game.dialogueMode = 'pre_boss';
        game.gameMode = 'dialogue';
    } else {
        doSpawnBoss(bp);
    }
}

function doSpawnBoss(bp) {
    game.enemies.push({ x: 400, y: TB + 60, size: bp.size, hp: bp.hp, maxHp: bp.hp, atk: bp.atk, alive: true, isBoss: true, name: bp.name, exp: bp.exp, tm: 0, tm2: 0, ph: 1, phDone: false });
    game.gameMode = 'battle';
    doNtf('⚠ BOSS降临：' + bp.name + '！');
}

export function doMeleeHit() {
    if (game.HL.anim.hit) return;
    game.HL.anim.hit = true;
    const gMul = game.greatSwordT > 0 ? 3 : 1;
    const dmg = Math.round((atkBase() * aMult()) * (game.greatSwordT > 0 ? 1.3 : 1)), deg = 130;
    const a = game.HL.fA, hd = deg / 2, len = 56 * gMul;
    const shX = game.HL.x + Math.cos(a) * 10, shY = game.HL.y + Math.sin(a) * 10;
    const ext = game.HL.anim.atkT / 0.28;
    const swA = game.HL.anim.swL, sD = game.HL.anim.swS;
    const swDeg = sD + swA * ext, swRad = swDeg * Math.PI / 180;
    const fx = game.HL.x + Math.cos(swRad) * 40 * gMul, fy = game.HL.y + Math.sin(swRad) * 40 * gMul;
    spawnSwordFX(fx, fy, swRad, hd, len);
    for (const e of game.enemies) {
        if (!e.alive) continue;
        const dx = e.x - shX, dy = e.y - shY, d = Math.hypot(dx, dy);
        if (d < len + 6 && Math.abs(angleDiff(Math.atan2(dy, dx), a)) < hd * Math.PI / 180) {
            if (!e.isBoss) { e.alive = false; hitFX(e); game.spiritStones += 1 + Math.floor(Math.random() * 3); game.CL.exp += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); }
            else {
                e.hp -= dmg; hitFX(e); onPlayerDealDamage(dmg);
                if (e.hp <= 0) defeatBoss(e);
            }
        }
    }
}

export function defeatBoss(e) {
    e.alive = false; game.bDef = true;
    const ss = 20 + game.curS * 10 + Math.floor(Math.random() * 30); game.spiritStones += ss;
    doNtf('🏆 击败' + e.name + '！经验+' + e.exp + ' 灵石+' + ss);
    gainExp(e.exp); game.sClr = true;
    if (!game.clearedStages.includes(game.curS)) game.clearedStages.push(game.curS);
    const bt = TECHNIQUES.find(t => t.type === 'boss' && t.bossIdx === game.curS);
    if (bt && !game.bossTechs.includes(bt.id)) {
        game.bossTechs.push(bt.id);
        doNtf('📜 获得功法：' + bt.name + '！');
    }
    const bp = STAGES[game.curS].boss;
    if (bp.post && bp.post.length > 0) {
        game.dialogueLines = bp.post;
        game.dialogueIdx = 0;
        game.dialogueMode = 'post_boss';
        game.gameMode = 'dialogue';
    } else {
        goToHubAfterBoss();
    }
}

export function goToHubAfterBoss() {
    if (Math.random() < 0.5) {
        triggerRandomEvent();
    } else {
        game.gameMode = 'hub'; game.hubSel = 0; game.hubMode = 'main';
    }
}
