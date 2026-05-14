import { STAGES, DIFF_MULT, TECHNIQUES, WORLD_MAP } from './config.js';
import { game } from './state.js';
import { W, H, TB } from './engine.js';
import { atkBase, aMult, doNtf, gainExp, angleDiff, hitFX, spawnSwordFX, maxHP } from './utils.js';
import { onPlayerDealDamage, onEnemyKilled } from './techniques.js';
import { triggerRandomEvent } from './events.js';
import { rollLoot } from './loot.js';

function getStageRegion(stageId) {
    if (!stageId) return 'tianNan';
    if (stageId.startsWith('qx') || stageId.startsWith('hf') || stageId.startsWith('zm') || stageId.startsWith('ly')) return 'tianNan';
    if (stageId.startsWith('lx')) return 'luanXing';
    if (stageId.startsWith('ml') || stageId.startsWith('tl')) return 'caoYuan';
    if (stageId.startsWith('dj')) return 'daJin';
    if (stageId.startsWith('jb')) return 'jiBei';
    return 'tianNan';
}

const REGION_ENEMIES = {
    tianNan: {
        melee: { type: '散修', bCl: '#4a3020', rCl: '#5a4030', hCl: '#c0a880', eCl: '#600' },
        ranged: { type: '魔修', bCl: '#302040', rCl: '#403050', hCl: '#a890b0', eCl: '#60c' },
        charger: { type: '狼妖', bCl: '#4a3a2a', rCl: '#5a4a3a', hCl: '#8a7a6a', eCl: '#f80' },
        summoner: { type: '蛇妖', bCl: '#2a4a2a', rCl: '#3a5a3a', hCl: '#6a8a4a', eCl: '#0f0' },
    },
    luanXing: {
        melee: { type: '海贼', bCl: '#2a3a4a', rCl: '#3a4a5a', hCl: '#c0a880', eCl: '#048' },
        ranged: { type: '海妖', bCl: '#2a4a5a', rCl: '#3a5a6a', hCl: '#a0c0d0', eCl: '#0af' },
        charger: { type: '鸟妖', bCl: '#3a3a4a', rCl: '#4a4a5a', hCl: '#d0d0e0', eCl: '#ff0' },
        summoner: { type: '水母妖', bCl: '#4a3a5a', rCl: '#5a4a6a', hCl: '#c0a0d0', eCl: '#f0f' },
    },
    caoYuan: {
        melee: { type: '牛妖', bCl: '#5a3a1a', rCl: '#6a4a2a', hCl: '#a08060', eCl: '#a40' },
        ranged: { type: '弓骑兵', bCl: '#4a3a1a', rCl: '#5a4a2a', hCl: '#c0a060', eCl: '#840' },
        charger: { type: '巨人', bCl: '#5a3a2a', rCl: '#6a4a3a', hCl: '#d0b880', eCl: '#f00' },
        summoner: { type: '萨满', bCl: '#3a2a4a', rCl: '#4a3a5a', hCl: '#a080a0', eCl: '#a0f' },
    },
    daJin: {
        melee: { type: '邪修', bCl: '#1a1a2a', rCl: '#2a2a3a', hCl: '#9080a0', eCl: '#c0f' },
        ranged: { type: '鬼修', bCl: '#0a0a1a', rCl: '#1a1a2a', hCl: '#808090', eCl: '#80f' },
        charger: { type: '尸魔', bCl: '#2a1a1a', rCl: '#3a2a2a', hCl: '#706060', eCl: '#f40' },
        summoner: { type: '阴魂', bCl: '#1a1a3a', rCl: '#2a2a4a', hCl: '#a0a0c0', eCl: '#c0c' },
    },
    jiBei: {
        melee: { type: '雪兽', bCl: '#d0d8e0', rCl: '#e0e8f0', hCl: '#a0b0c0', eCl: '#08f' },
        ranged: { type: '冰修', bCl: '#b0c0d0', rCl: '#c0d0e0', hCl: '#e0e8f0', eCl: '#0cf' },
        charger: { type: '冰熊', bCl: '#c0d0e0', rCl: '#d0e0f0', hCl: '#b0c0d0', eCl: '#06f' },
        summoner: { type: '霜妖', bCl: '#a0c0d0', rCl: '#b0d0e0', hCl: '#d0e0f0', eCl: '#0ff' },
    },
};

export function getEnemySkin(region, role) {
    const r = REGION_ENEMIES[region] || REGION_ENEMIES['tianNan'];
    const s = r[role] || r['melee'];
    return s;
}

function findMapNode(nodes, id) {
    for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) { const f = findMapNode(n.children, id); if (f) return f; }
    }
    return null;
}

export function applyChestReward() {
    const node = findMapNode(WORLD_MAP, game.curStageId);
    if (!node || !node.chest) return;
    if (node.chest.stones) {
        const [min, max] = node.chest.stones;
        const amt = min + Math.floor(Math.random() * (max - min + 1));
        game.spiritStones += amt;
        doNtf('🎁 宝箱获得 💎+' + amt);
    }
    if (node.chest.items) {
        for (const it of node.chest.items) {
            game.inventory[it] = (game.inventory[it] || 0) + 1;
            doNtf('🎁 宝箱获得 ' + it);
        }
    }
}

export function spawnWave() {
    if (game.sClr) return;
    const sd = STAGES.find(s => s.id === game.curStageId);
    if (!sd) return;
    if (game.sWv >= sd.waves) { if (!game.bSp) spawnBoss(); return; }
    const region = getStageRegion(game.curStageId);
    const cnt = 3 + game.sWv * 2;
    const pool = [];
    pool.push({ role: 'melee', weight: 5 });
    if (game.sWv >= 2) pool.push({ role: 'ranged', weight: 3 });
    if (game.sWv >= 3) pool.push({ role: 'charger', weight: 2 });
    if (game.sWv >= 5) pool.push({ role: 'summoner', weight: 1 });
    for (let i = 0; i < cnt; i++) {
        let x, y;
        do { x = 40 + Math.random() * (W - 80); y = TB + 30 + Math.random() * (H - TB - 100); }
        while (Math.hypot(x - game.HL.x, y - game.HL.y) < 110);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const skin = getEnemySkin(region, pick.role);
        const dm = DIFF_MULT[game.difficulty];
        const enemy = { x, y, type: skin.type, skin, role: pick.role, alive: true, tm: Math.random() * 2, region };
        if (pick.role === 'ranged') {
            enemy.size = 9; enemy.hp = Math.round((2 + game.sWv) * dm.enemyHpMul); enemy.spd = Math.round((10 + game.sWv * 5) * dm.enemySpdMul); enemy.atkCd = 0;
        } else if (pick.role === 'charger') {
            enemy.size = 12; enemy.hp = Math.round((3 + game.sWv * 2) * dm.enemyHpMul); enemy.spd = Math.round((60 + game.sWv * 20) * dm.enemySpdMul); enemy.charging = false; enemy.chCd = 0;
        } else if (pick.role === 'summoner') {
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
    const sd = STAGES.find(s => s.id === game.curStageId);
    const bp = sd ? sd.boss : null;
    if (!bp) {
        game.sClr = true;
        if (!game.clearedStages.includes(game.curStageId)) game.clearedStages.push(game.curStageId);
        applyChestReward();
        doNtf('✓ ' + (sd ? sd.name : '') + ' 通关！按R进入大厅');
        return;
    }
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
    const dmg = Math.round(atkBase() * aMult()), deg = 130;
    const a = game.HL.fA, hd = deg / 2, len = 56;
    const shX = game.HL.x + Math.cos(a) * 10, shY = game.HL.y + Math.sin(a) * 10;
    const ext = game.HL.anim.atkT / 0.28;
    const swA = game.HL.anim.swL, sD = game.HL.anim.swS;
    const swDeg = sD + swA * ext, swRad = swDeg * Math.PI / 180;
    const fx = game.HL.x + Math.cos(swRad) * 40, fy = game.HL.y + Math.sin(swRad) * 40;
    spawnSwordFX(fx, fy, swRad, hd, len);
    for (const e of game.enemies) {
        if (!e.alive) continue;
        const dx = e.x - shX, dy = e.y - shY, d = Math.hypot(dx, dy);
        if (d < len + 6 && Math.abs(angleDiff(Math.atan2(dy, dx), a)) < hd * Math.PI / 180) {
            if (!e.isBoss) { e.alive = false; hitFX(e); game.spiritStones += 1 + Math.floor(Math.random() * 3); game.CL.exp += 1 + Math.floor(Math.random() * 2); rollLoot(e.type, e.x, e.y); onEnemyKilled(); }
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
    if (!game.clearedStages.includes(game.curStageId)) game.clearedStages.push(game.curStageId);
    applyChestReward();
    const sd = STAGES.find(s => s.id === game.curStageId);
    const bp = sd ? sd.boss : null;
    const lootSummary = [];
    if (ss > 0) lootSummary.push('💎' + ss + '灵石');
    if (e.exp > 0) lootSummary.push('EXP+' + e.exp);
    if (bp && bp.drops) {
        for (const drop of bp.drops) {
            game.inventory[drop] = (game.inventory[drop] || 0) + 1;
            lootSummary.push(drop);
            doNtf('🔑 获得关键道具：' + drop);
        }
    }
    if (sd && sd.escape) {
        game.inventory[sd.escape] = (game.inventory[sd.escape] || 0) + 1;
        lootSummary.push(sd.escape);
        doNtf('🔑 获得关键道具：' + sd.escape);
    }
    const node = findMapNode(WORLD_MAP, game.curStageId);
    if (node && node.chest) {
        if (node.chest.items) for (const it of node.chest.items) lootSummary.push(it);
    }
    const bt = TECHNIQUES.find(t => t.type === 'boss' && t.bossStage === game.curStageId);
    if (bt && !game.bossTechs.includes(bt.id)) {
        game.bossTechs.push(bt.id);
        lootSummary.push('📜' + bt.name);
        doNtf('📜 获得功法：' + bt.name + '！');
    }
    if (bp && bp.post && bp.post.length > 0 && !game.bossRushMode) {
        game.dialogueLines = [...bp.post, { speaker: 'loot', text: '🎁 获得 ' + lootSummary.join(', ') }];
        game.dialogueIdx = 0;
        game.dialogueMode = 'post_boss';
        game.gameMode = 'dialogue';
    } else if (lootSummary.length > 0 && game.bossRushMode) {
        doNtf('🎁 Boss挑战：' + lootSummary.join(', '));
        game.bossRushMode = false;
        goToHubAfterBoss();
    } else if (lootSummary.length > 0) {
        goToHubAfterBoss();
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
