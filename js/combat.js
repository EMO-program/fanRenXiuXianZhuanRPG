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

function findParentNode(nodes, id) {
    for (const n of nodes) {
        if (n.children) {
            for (const c of n.children) {
                if (c.id === id) return n;
            }
            const f = findParentNode(n.children, id);
            if (f) return f;
        }
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

const ENEMY_STATS = {
    melee:    { baseHp: 15, hpPerWave: 5,  baseSize: 10, spd: 30, aggroRange: 160, patrolRange: 80, atk: 5 },
    ranged:   { baseHp: 8,  hpPerWave: 3,  baseSize: 9,  spd: 15, aggroRange: 250, patrolRange: 60, atk: 3 },
    charger:  { baseHp: 10, hpPerWave: 4,  baseSize: 12, spd: 50, aggroRange: 200, patrolRange: 70, atk: 7 },
    summoner: { baseHp: 12, hpPerWave: 4,  baseSize: 10, spd: 12, aggroRange: 180, patrolRange: 50, atk: 4 },
};

export function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }

export function getRoomKey(x, y) { return x + ',' + y; }

function getSiblingStages(stageId) {
    const parentNode = findParentNode(WORLD_MAP, stageId);
    if (!parentNode || !parentNode.children) return [];
    return parentNode.children.filter(c => c.id !== stageId && c.stage);
}

function getNextStageId(stageId) {
    const parentNode = findParentNode(WORLD_MAP, stageId);
    if (!parentNode || !parentNode.children) return null;
    const siblings = parentNode.children.filter(c => c.stage);
    const myIdx = siblings.findIndex(c => c.id === stageId);
    if (myIdx < 0 || myIdx >= siblings.length - 1) return null;
    return siblings[myIdx + 1].id;
}

function getMaxRoomsForStage(stageId) {
    const idx = STAGES.findIndex(s => s.id === stageId);
    if (idx < 0) return 5;
    return Math.min(5 + Math.floor(idx / 3), 10);
}

function getUnlockHint(stageNode) {
    if (!stageNode || !stageNode.unlock) return '';
    const parts = [];
    const u = stageNode.unlock;
    const S3 = ['初期', '中期', '后期'];
    if (u.realm) {
        let st = '';
        if (u.realmStage) st = u.realm === '炼气' ? u.realmStage + '层' : S3[Math.min(u.realmStage - 1, 2)];
        parts.push('境界≥' + u.realm + '·' + st);
    }
    if (u.clear) parts.push('需通关：' + u.clear.map(id => {
        const s = STAGES.find(st => st.id === id);
        return s ? s.name : id;
    }).join(' '));
    if (u.items) parts.push('需要：' + u.items.join(' + '));
    return parts.join(' | ');
}

function getStageBaseCoords(stageId) {
    let maxAbsX = 0;
    for (const key in game.roomGrid) {
        const r = game.roomGrid[key];
        maxAbsX = Math.max(maxAbsX, Math.abs(r.x));
    }
    const existingCount = Object.keys(game.roomGrid).length;
    if (existingCount === 0) return { bx: 0, by: 0 };
    return { bx: maxAbsX + 4, by: 0 };
}

const cardDirs = [{ dx: 0, dy: -1, d: 'up' }, { dx: 0, dy: 1, d: 'down' }, { dx: -1, dy: 0, d: 'left' }, { dx: 1, dy: 0, d: 'right' }];

function placeRoomContent(x, y, stageId, region, dm, isBossRoom) {
    if (isBossRoom) {
        const enemies = spawnBossEnemies(stageId);
        return { enemies, hasChest: false };
    }
    const dist = Math.abs(x) + Math.abs(y);
    const chestChance = dist > 0 ? 0.25 : 0;
    if (Math.random() < chestChance) {
        const stoneAmt = 10 + Math.floor(Math.random() * 20) + dist * 5;
        return { enemies: [], hasChest: true, chestStones: stoneAmt };
    }
    const cnt = Math.min(1 + Math.floor(dist * 0.8) + Math.floor(Math.random() * 2), 6);
    const pool = [];
    pool.push({ role: 'melee', weight: 5 });
    if (dist >= 1) pool.push({ role: 'ranged', weight: 3 });
    if (dist >= 2) pool.push({ role: 'charger', weight: 2 });
    if (dist >= 4) pool.push({ role: 'summoner', weight: 1 });
    const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
    const positions = distributePositions(cnt);
    const eliteChance = dist >= 3 ? Math.min(0.3, dist * 0.04) : 0;
    const enemies = [];
    const waveLevel = Math.max(1, dist);
    for (let i = 0; i < cnt; i++) {
        const { px, py } = positions[i] || { px: 80 + Math.random() * (W - 160), py: TB + 60 + Math.random() * (H - TB - 120) };
        let r = Math.random() * totalWeight, pick = pool[0];
        for (const p of pool) { r -= p.weight; if (r <= 0) { pick = p; break; } }
        const skin = getEnemySkin(region, pick.role);
        const elite = Math.random() < eliteChance;
        const enemy = makeEnemy(px, py, pick.role, skin, dm, waveLevel, elite);
        enemies.push(enemy);
    }
    return { enemies, hasChest: false };
}

function distributePositions(cnt) {
    const margin = 50; const top = TB + 50; const bottom = H - 70; const left = margin; const right = W - margin;
    const positions = [];
    const cols = Math.ceil(Math.sqrt(cnt * (right - left) / (bottom - top)));
    const rows = Math.ceil(cnt / cols);
    const cellW = (right - left) / cols, cellH = (bottom - top) / rows;
    for (let i = 0; i < cnt; i++) {
        const r = Math.floor(i / cols), c = i % cols;
        const cx = left + (c + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.4;
        const cy = top + (r + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.4;
        const px = Math.max(left, Math.min(right, cx));
        const py = Math.max(top, Math.min(bottom, cy));
        positions.push({ px, py });
    }
    return positions;
}

function preGenerateRooms(stageId, baseX, baseY) {
    const maxRooms = getMaxRoomsForStage(stageId);
    const entranceKey = getRoomKey(baseX, baseY);
    const region = getStageRegion(stageId);
    const dm = DIFF_MULT[game.difficulty];
    const allDirs = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    ];

    const occupied = {};
    occupied[entranceKey] = true;
    const cells = [{ x: baseX, y: baseY }];

    const seedBase = hashStr(stageId + '_gen');
    let seed = seedBase;

    while (cells.length < maxRooms) {
        const srcIdx = (seed % 10007) % cells.length;
        const src = cells[srcIdx];
        seed = hashStr(stageId + '_s_' + seed);

        let placed = false;
        const shufDirs = [...allDirs];
        for (let i = shufDirs.length - 1; i > 0; i--) {
            seed = hashStr(stageId + '_sh_' + seed + '_' + i);
            const j = seed % (i + 1);
            [shufDirs[i], shufDirs[j]] = [shufDirs[j], shufDirs[i]];
        }

        for (const { dx, dy } of shufDirs) {
            const nx = src.x + dx, ny = src.y + dy;
            const nKey = getRoomKey(nx, ny);
            if (occupied[nKey]) continue;
            let nbCount = 0;
            for (const { dx: ddx, dy: ddy } of allDirs) {
                if (occupied[getRoomKey(nx + ddx, ny + ddy)]) nbCount++;
            }
            if (nbCount > 2) continue;
            occupied[nKey] = true;
            cells.push({ x: nx, y: ny });
            placed = true;
            break;
        }
        if (!placed && cells.length > 1) {
            cells.splice(srcIdx, 1);
        }
        if (!placed && cells.length <= 1) break;
    }
    const entranceExits = {};
    for (const { dx, dy, d } of cardDirs) {
        entranceExits[d] = occupied[getRoomKey(baseX + dx, baseY + dy)] || false;
    }
    if (!entranceExits.up && !entranceExits.down && !entranceExits.left && !entranceExits.right) {
        entranceExits.right = true;
    }

    const roomKeys = Object.keys(occupied);
    const bridgeKeys = roomKeys.filter(k => k !== entranceKey);
    const nextStageId = getNextStageId(stageId);
    let bridgeRoomKey = null;
    let bridgePlan = null;
    if (bridgeKeys.length > 0 && nextStageId) {
        bridgeRoomKey = bridgeKeys[hashStr(stageId + '_bri_pk') % bridgeKeys.length];
        const bDir = cardDirs[hashStr(stageId + '_bri_dir') % 4].d;
        bridgePlan = { dir: bDir, targetStageId: nextStageId };
    }

    const { enemies: entEnemies, hasChest: entHasChest, chestStones: entChestStones } = placeRoomContent(baseX, baseY, stageId, region, dm, false);
    game.roomGrid[entranceKey] = {
        x: baseX, y: baseY, stageId, exits: entranceExits, bridge: null,
        enemies: entEnemies, hasChest: entHasChest, chestStones: entChestStones || 0,
        chestX: W / 2, chestY: (TB + H) / 2, chestOpened: false,
        visited: true, cleared: false, isBossRoom: false, isEntrance: true
    };

    for (const key of bridgeKeys) {
        const [rx, ry] = key.split(',').map(Number);
        let exits = { up: false, down: false, left: false, right: false };
        for (const { dx, dy, d } of cardDirs) {
            if (occupied[getRoomKey(rx + dx, ry + dy)]) exits[d] = true;
        }
        const cnt = (exits.up ? 1 : 0) + (exits.down ? 1 : 0) + (exits.left ? 1 : 0) + (exits.right ? 1 : 0);
        if (cnt < 1) {
            for (const { dx, dy, d } of cardDirs) {
                if (occupied[getRoomKey(rx + dx, ry + dy)]) { exits[d] = true; break; }
            }
        }
        if (cnt > 3) {
            const keys = ['up', 'down', 'left', 'right'];
            for (let i = 0; i < keys.length && cnt > 3; i++) { if (exits[keys[i]]) { exits[keys[i]] = false; break; } }
        }
        const thisBridge = (key === bridgeRoomKey) ? bridgePlan : null;
        if (thisBridge) {
            exits[thisBridge.dir] = true;
            const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
            exits[opp[thisBridge.dir]] = false;
        }
        const { enemies, hasChest, chestStones } = placeRoomContent(rx, ry, stageId, region, dm, false);
        game.roomGrid[key] = {
            x: rx, y: ry, stageId, exits, bridge: thisBridge,
            enemies, hasChest, chestStones: chestStones || 0,
            chestX: W / 2, chestY: (TB + H) / 2, chestOpened: false,
            visited: false, cleared: false, isBossRoom: false, isEntrance: false
        };
    }

    game.roomsFound = roomKeys.length;

    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
    for (const key of roomKeys) {
        const r = game.roomGrid[key];
        if (!r || r.bridge) continue;
        const [rx, ry] = key.split(',').map(Number);
        for (const { dx, dy, d } of cardDirs) {
            if (!r.exits[d]) continue;
            const nKey = getRoomKey(rx + dx, ry + dy);
            const nRoom = game.roomGrid[nKey];
            if (nRoom && nRoom.bridge && nRoom.bridge.dir === opp[d]) {
                r.exits[d] = false;
            }
        }
    }

    const sd2 = STAGES.find(s => s.id === stageId);
    if (sd2 && sd2.stage && sd2.stage.boss) {
        const bossCandidates = [
            { x: baseX + 2, y: baseY + 0 }, { x: baseX + 3, y: baseY + 1 },
            { x: baseX + 2, y: baseY + 2 }, { x: baseX + 1, y: baseY + 2 },
            { x: baseX + 3, y: baseY + 0 }, { x: baseX + 2, y: baseY - 1 },
        ];
        const bRaw = hashStr(stageId + '_boss_pos') % bossCandidates.length;
        game.bossRoomKey = getRoomKey(bossCandidates[bRaw].x, bossCandidates[bRaw].y);
    }
}

export function initRooms(stageId) {
    game.roomGrid = {};
    game.roomX = 0; game.roomY = 0;
    game.roomsFound = 0; game.roomsCleared = 0;
    game.bossRoomKey = null; game.bossRoomRevealed = false;
    game.transitCD = 0; game.bSp = false; game.bDef = false; game.sClr = false;
    game.bridgePlans = [];
    game.curStageId = stageId;
    const base = getStageBaseCoords(stageId);
    game.stageBaseX = base.bx; game.stageBaseY = base.by;
    game.maxRoomsForStage = getMaxRoomsForStage(stageId);
    preGenerateRooms(stageId, base.bx, base.by);
    const entranceKey = getRoomKey(base.bx, base.by);
    game.enemies = game.roomGrid[entranceKey]?.enemies || [];
    game.roomX = base.bx; game.roomY = base.by;
    enterRoomVisual();
}

function isStageUnlocked2(node) {
    if (!node || !node.unlock) return true;
    const u = node.unlock;
    const realmOrder = ['炼气', '筑基', '结丹', '元婴', '化神'];
    if (u.realm) {
        const ri = realmOrder.indexOf(game.CL.realm);
        const ui = realmOrder.indexOf(u.realm);
        if (ri < ui || (ri === ui && u.realmStage && game.CL.stage < u.realmStage)) return false;
    }
    if (u.clear) {
        for (const id of u.clear) { if (!game.clearedStages.includes(id)) return false; }
    }
    if (u.items) {
        for (const it of u.items) { if (!game.inventory[it] || game.inventory[it] <= 0) return false; }
    }
    return true;
}

function isBridgeUnlocked(node) {
    if (!node || !node.unlock) return true;
    const u = node.unlock;
    const realmOrder = ['炼气', '筑基', '结丹', '元婴', '化神'];
    if (u.realm) {
        const ri = realmOrder.indexOf(game.CL.realm);
        const ui = realmOrder.indexOf(u.realm);
        if (ri < ui || (ri === ui && u.realmStage && game.CL.stage < u.realmStage)) return false;
    }
    if (u.items) {
        for (const it of u.items) { if (!game.inventory[it] || game.inventory[it] <= 0) return false; }
    }
    return true;
}

function revealBossRoom() {
    if (!game.bossRoomKey || game.bossRoomRevealed) return;
    const [bx, by] = game.bossRoomKey.split(',').map(Number);
    const sd = STAGES.find(s => s.id === game.curStageId);
    if (!sd || !sd.stage || !sd.stage.boss) return;
    const bp = sd.stage.boss;
    game.roomGrid[game.bossRoomKey] = { x: bx, y: by, stageId: game.curStageId, exits: { up: false, down: false, left: false, right: false }, bridge: null, enemies: [], hasChest: false, chestStones: 0, chestX: W / 2, chestY: (TB + H) / 2, chestOpened: false, visited: false, cleared: false, isBossRoom: true, bossName: bp.name };
    game.bossRoomRevealed = true;
    const adjRooms = [];
    for (const key in game.roomGrid) {
        const r = game.roomGrid[key];
        if (r.stageId !== game.curStageId) continue;
        const dx = Math.abs(r.x - bx) + Math.abs(r.y - by);
        if (dx === 1) adjRooms.push(r);
    }
    if (adjRooms.length > 0) {
        const link = adjRooms[Math.floor(Math.random() * adjRooms.length)];
        if (bx > link.x) link.exits.right = true;
        else if (bx < link.x) link.exits.left = true;
        else if (by > link.y) link.exits.down = true;
        else if (by < link.y) link.exits.up = true;
        const bRoom = game.roomGrid[game.bossRoomKey];
        if (bx > link.x) bRoom.exits.left = true;
        else if (bx < link.x) bRoom.exits.right = true;
        else if (by > link.y) bRoom.exits.up = true;
        else if (by < link.y) bRoom.exits.down = true;
    }
    game.roomsFound++;
    doNtf('⚡ Boss密室出现！在' + bp.name + '的方向！');
}

export function checkRoomClear() {
    const aliveEnemies = game.enemies.filter(e => e.alive);
    if (aliveEnemies.length > 0) return;
    const key = getRoomKey(game.roomX, game.roomY);
    const room = game.roomGrid[key];
    if (!room || room.cleared) return;
    room.cleared = true;
    game.roomsCleared++;
    const stoneReward = 5 + Math.floor(Math.random() * 15);
    game.spiritStones += stoneReward;
    game.CL.exp += 3 + Math.floor(Math.random() * 5);
    doNtf('✓ 房间清除！灵石+' + stoneReward);
    if (room.isBossRoom) {
        if (!game.bDef) {
            game.sClr = true; game.bDef = true; game.bSp = true;
            bossCleared();
        }
    } else if (!game.bossRoomRevealed && game.bossRoomKey) {
        const stageRooms = Object.values(game.roomGrid).filter(r => r.stageId === game.curStageId && !r.isBossRoom);
        const stageCleared = stageRooms.filter(r => r.cleared).length;
        if (stageCleared >= stageRooms.length) {
            revealBossRoom();
        }
    }
}

function markRoomCleared(room) {
    if (room.cleared) return;
    room.cleared = true;
    game.roomsCleared++;
}

export function tryOpenChest() {
    const key = getRoomKey(game.roomX, game.roomY);
    const room = game.roomGrid[key];
    if (!room || !room.hasChest || room.chestOpened) return false;
    const px = game.HL.x, py = game.HL.y;
    const cx = room.chestX || W / 2, cy = room.chestY || ((TB + H) / 2);
    if (Math.hypot(px - cx, py - cy) > 50) return false;
    room.chestOpened = true;
    const stones = room.chestStones || (10 + Math.floor(Math.random() * 20));
    game.spiritStones += stones;
    doNtf('🎁 打开宝箱！获得灵石 ×' + stones);
    return true;
}

function bossCleared() {
    const sd = STAGES.find(s => s.id === game.curStageId);
    if (!sd || !sd.stage || !sd.stage.boss) return;
    const bp = sd.stage.boss;
    const ss = 20 + game.curS * 10 + Math.floor(Math.random() * 30);
    game.spiritStones += ss;
    doNtf('🏆 击败' + bp.name + '！经验+' + bp.exp + ' 灵石+' + ss);
    gainExp(bp.exp);
    if (!game.clearedStages.includes(game.curStageId)) game.clearedStages.push(game.curStageId);
    applyChestReward();
    const lootSummary = [ss + '灵石', 'EXP+' + bp.exp];
    if (bp.drops) {
        for (const drop of bp.drops) {
            game.inventory[drop] = (game.inventory[drop] || 0) + 1;
            lootSummary.push(drop);
            doNtf('🔑 获得：' + drop);
        }
    }
    if (sd.stage.escape) {
        game.inventory[sd.stage.escape] = (game.inventory[sd.stage.escape] || 0) + 1;
        lootSummary.push(sd.stage.escape);
        doNtf('🔑 获得：' + sd.stage.escape);
    }
    const bt = TECHNIQUES.find(t => t.type === 'boss' && t.bossStage === game.curStageId);
    if (bt && !game.bossTechs.includes(bt.id)) {
        game.bossTechs.push(bt.id);
        lootSummary.push(bt.name);
        doNtf('📜 获得功法：' + bt.name + '！');
    }
    if (bp.post && bp.post.length > 0 && !game.bossRushMode) {
        game.dialogueLines = [...bp.post, { speaker: 'loot', text: '🎁 ' + lootSummary.join(', ') }];
        game.dialogueIdx = 0; game.dialogueMode = 'post_boss'; game.gameMode = 'dialogue';
    } else {
        goToHubAfterBoss();
    }
}

function enterRoomVisual() {
    game.effects.push({ x: game.HL.x, y: game.HL.y, tp: 'flare', life: 0.35, ml: 0.35, cl: '#ffffff', sz: 18 });
    game.transitCD = 0.8;
}

export function tryTransitRoom(direction) {
    if (game.transitCD > 0) return false;
    const key = getRoomKey(game.roomX, game.roomY);
    const room = game.roomGrid[key];
    if (!room || !room.exits[direction]) return false;

    if (room.bridge && room.bridge.dir === direction) {
        return enterBridgeStage(room.bridge.targetStageId, direction, game.curStageId, key, room.bridge.returnRoomKey);
    }

    let nx = game.roomX, ny = game.roomY;
    if (direction === 'up') ny--;
    else if (direction === 'down') ny++;
    else if (direction === 'left') nx--;
    else if (direction === 'right') nx++;
    const nextKey = getRoomKey(nx, ny);

    if (nextKey === game.bossRoomKey && !game.bossRoomRevealed) {
        const clearedCount = Object.values(game.roomGrid).filter(r => r.cleared && !r.isBossRoom && r.stageId === game.curStageId).length;
        const totalNonBoss = Object.values(game.roomGrid).filter(r => !r.isBossRoom && r.stageId === game.curStageId).length;
        if (clearedCount < totalNonBoss) {
            doNtf('🔒 需清除当前关卡所有区域后才能进入密室');
            return false;
        }
    }
    if (nextKey === game.bossRoomKey && !game.roomGrid[nextKey] && !game.bossRoomRevealed) {
        doNtf('🔒 条件未满足，无法进入密室');
        return false;
    }

    if (!game.roomGrid[nextKey]) {
        doNtf('🔒 此路不通');
        return false;
    }
    const nextRoom = game.roomGrid[nextKey];
    if (nextRoom.stageId !== game.curStageId) {
        game.curStageId = nextRoom.stageId;
    }
    game.roomX = nx; game.roomY = ny;
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const oppD = opp[direction];
    const hasBridgeConflict = nextRoom.bridge && (nextRoom.bridge.dir === oppD || opp[nextRoom.bridge.dir] === oppD);
    if (!hasBridgeConflict) {
        nextRoom.exits[oppD] = true;
    }
    if (nextRoom.isBossRoom && nextRoom.enemies.length === 0) {
        nextRoom.enemies = spawnBossEnemies(nextRoom.stageId || game.curStageId);
        game.bSp = true;
        doNtf('⚠ BOSS降临：' + nextRoom.bossName + '！');
    }
    game.enemies = nextRoom.enemies;
    nextRoom.visited = true;
    if (direction === 'up') game.HL.y = H - 60;
    else if (direction === 'down') game.HL.y = TB + 50;
    else if (direction === 'left') game.HL.x = W - 50;
    else if (direction === 'right') game.HL.x = 50;
    enterRoomVisual();
    return true;
}

function enterBridgeStage(targetStageId, direction, sourceStageId, sourceRoomKey, returnRoomKey) {
    const targetNode = findMapNode(WORLD_MAP, targetStageId);
    if (!targetNode) return false;
    if (!isBridgeUnlocked(targetNode)) {
        const hint = getUnlockHint(targetNode);
        doNtf('🔒 无法进入' + targetNode.name + (hint ? '：' + hint : ''));
        return false;
    }
    const isBossStage = targetNode.stage && targetNode.stage.boss;
    if (isBossStage && !isStageUnlocked2(targetNode)) {
        const hint = getUnlockHint(targetNode);
        doNtf('🔒 Boss密室封锁：' + (hint || '条件未满足'));
        return false;
    }
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };

    function cleanNeighborExits(bKey) {
        const [bx, by] = bKey.split(',').map(Number);
        const bRoom = game.roomGrid[bKey];
        if (!bRoom || !bRoom.bridge) return;
        for (const { dx, dy, d } of cardDirs) {
            const nKey = getRoomKey(bx + dx, by + dy);
            const nRoom = game.roomGrid[nKey];
            if (nRoom && !nRoom.bridge && nRoom.exits[opp[d]] && bRoom.bridge.dir === d) {
                nRoom.exits[opp[d]] = false;
            }
        }
    }

    if (returnRoomKey) {
        const retRoom = game.roomGrid[returnRoomKey];
        if (retRoom && retRoom.stageId === targetStageId) {
            game.curStageId = targetStageId;
            game.roomX = retRoom.x; game.roomY = retRoom.y;
            retRoom.visited = true;
            retRoom.exits[opp[direction]] = true;
            retRoom.exits[direction] = false;
            retRoom.bridge = { dir: opp[direction], targetStageId: sourceStageId, returnRoomKey: sourceRoomKey };
            cleanNeighborExits(returnRoomKey);
            game.enemies = retRoom.enemies;
            game.stageBaseX = Math.min(game.stageBaseX, retRoom.x);
            game.stageBaseY = Math.min(game.stageBaseY, retRoom.y);
            if (direction === 'up') game.HL.y = H - 60;
            else if (direction === 'down') game.HL.y = TB + 50;
            else if (direction === 'left') game.HL.x = W - 50;
            else if (direction === 'right') game.HL.x = 50;
            enterRoomVisual();
            doNtf('🗺 返回' + targetNode.name);
            return true;
        }
    }

    const existingEntrance = Object.values(game.roomGrid).find(r => r.stageId === targetStageId && r.isEntrance);
    if (existingEntrance && !returnRoomKey) {
        game.curStageId = targetStageId;
        game.roomX = existingEntrance.x;
        game.roomY = existingEntrance.y;
        existingEntrance.exits[opp[direction]] = true;
        existingEntrance.exits[direction] = false;
        existingEntrance.bridge = { dir: opp[direction], targetStageId: sourceStageId, returnRoomKey: sourceRoomKey };
        cleanNeighborExits(getRoomKey(existingEntrance.x, existingEntrance.y));
        existingEntrance.visited = true;
        game.enemies = existingEntrance.enemies;
        if (direction === 'up') game.HL.y = H - 60;
        else if (direction === 'down') game.HL.y = TB + 50;
        else if (direction === 'left') game.HL.x = W - 50;
        else if (direction === 'right') game.HL.x = 50;
        enterRoomVisual();
        if (!game.unlockedStages.includes(targetStageId)) game.unlockedStages.push(targetStageId);
        doNtf('🗺 进入' + targetNode.name);
        return true;
    }
    const base = getStageBaseCoords(targetStageId);
    game.stageBaseX = base.bx; game.stageBaseY = base.by;
    game.curStageId = targetStageId;
    game.maxRoomsForStage = getMaxRoomsForStage(targetStageId);
    preGenerateRooms(targetStageId, base.bx, base.by);
    const eKey = getRoomKey(base.bx, base.by);
    const eRoom = game.roomGrid[eKey];
    if (eRoom) {
        eRoom.exits[opp[direction]] = true;
        eRoom.exits[direction] = false;
        eRoom.bridge = { dir: opp[direction], targetStageId: sourceStageId, returnRoomKey: sourceRoomKey };
    }
    game.enemies = eRoom?.enemies || [];
    game.roomX = base.bx; game.roomY = base.by;
    if (!game.unlockedStages.includes(targetStageId)) game.unlockedStages.push(targetStageId);
    if (direction === 'up') game.HL.y = H - 60;
    else if (direction === 'down') game.HL.y = TB + 50;
    else if (direction === 'left') game.HL.x = W - 50;
    else if (direction === 'right') game.HL.x = 50;
    enterRoomVisual();
    doNtf('🗺 进入' + targetNode.name);
    return true;
}

export function canTransitAny() {
    const key = getRoomKey(game.roomX, game.roomY);
    const room = game.roomGrid[key];
    if (!room) return false;
    return room.exits.up || room.exits.down || room.exits.left || room.exits.right;
}

export function isAtEdge() {
    const m = 15;
    if (game.HL.x < m) return 'left';
    if (game.HL.x > W - m) return 'right';
    if (game.HL.y < TB + m) return 'up';
    if (game.HL.y > H - m) return 'down';
    return null;
}
function makeEnemy(x, y, role, skin, dm, wave, elite) {
    const st = ENEMY_STATS[role] || ENEMY_STATS.melee;
    const eliteMul = elite ? 2.5 : 1;
    const eliteSizeMul = elite ? 1.5 : 1;
    const hp = Math.round((st.baseHp + st.hpPerWave * wave) * dm.enemyHpMul * eliteMul);
    const size = Math.round(st.baseSize * eliteSizeMul);
    const spd = Math.round(st.spd * dm.enemySpdMul * (elite ? 0.85 : 1));
    const atk = Math.round(st.atk * (1 + wave * 0.3) * dm.enemyAtkMul * (elite ? 2 : 1));
    const aggroRange = st.aggroRange;
    const patrolRange = st.patrolRange;
    const patrolCx = x, patrolCy = y;
    const patrolAngle = Math.random() * Math.PI * 2;
    const enemy = {
        x, y, type: skin.type, skin, role, alive: true,
        hp, maxHp: hp, size, spd, atk,
        tm: Math.random() * 2, atkT: 0,
        aggroRange, patrolRange, patrolCx, patrolCy, patrolAngle,
        state: 'patrol', elite: !!elite, region: getStageRegion(game.curStageId),
    };
    if (role === 'ranged') { enemy.atkCd = 0; }
    if (role === 'charger') { enemy.charging = false; enemy.chCd = 0; }
    if (role === 'summoner') { enemy.sumCd = 0; }
    return enemy;
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
            if (e.isBoss) {
                e.hp -= dmg; hitFX(e); onPlayerDealDamage(dmg);
                if (e.hp <= 0) defeatBoss(e);
            } else {
                e.hp -= dmg; hitFX(e); onPlayerDealDamage(dmg);
                if (e.hp <= 0) {
                    e.alive = false;
                    const stoneBonus = e.elite ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 3);
                    game.spiritStones += stoneBonus;
                    game.CL.exp += 1 + Math.floor(Math.random() * 2) + (e.elite ? 3 : 0);
                    rollLoot(e.type, e.x, e.y);
                    onEnemyKilled();
                }
            }
        }
    }
}

export function killEnemy(e) {
    e.alive = false; hitFX(e);
    const stoneBonus = e.elite ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2);
    game.spiritStones += stoneBonus;
    game.CL.exp += 1 + Math.floor(Math.random() * 2) + (e.elite ? 3 : 0);
    rollLoot(e.type, e.x, e.y);
    onEnemyKilled();
}

export function updateEnemyAI(e, dt, eqDef, tb) {
    if (e.isBoss) return false;
    const edx = game.HL.x - e.x, edy = game.HL.y - e.y, ed = Math.hypot(edx, edy);
    e.tm = (e.tm || 0) + dt;
    e.atkT = Math.max(0, (e.atkT || 0) - dt);
    const aggro = e.aggroRange || 160;
    if (ed <= aggro) {
        e.state = 'chase';
    } else if (e.state === 'chase') {
        const distToHome = Math.hypot(e.x - e.patrolCx, e.y - e.patrolCy);
        if (distToHome > (e.patrolRange || 80) * 2) {
            e.state = 'return';
        }
    }
    if (e.state === 'patrol' || e.state === 'return') {
        e.patrolAngle = (e.patrolAngle || 0) + dt * 0.5;
        const tx = e.patrolCx + Math.cos(e.patrolAngle) * (e.patrolRange || 80) * 0.5;
        const ty = e.patrolCy + Math.sin(e.patrolAngle) * (e.patrolRange || 80) * 0.5;
        const pdx = tx - e.x, pdy = ty - e.y, pd = Math.hypot(pdx, pdy);
        if (pd > 2) {
            const pspd = (e.spd || 30) * 0.4;
            e.x += pdx / pd * pspd * dt;
            e.y += pdy / pd * pspd * dt;
        }
        if (e.state === 'return') {
            const distToHome = Math.hypot(e.x - e.patrolCx, e.y - e.patrolCy);
            if (distToHome < e.patrolRange * 0.5) e.state = 'patrol';
        }
        e.x = Math.max(16, Math.min(W - 16, e.x));
        e.y = Math.max(TB + 30, Math.min(H - 50, e.y));
        return true;
    }
    return false;
}

export function defeatBoss(e) {
    if (e.name.includes('墨大夫') && !e.ph2) {
        e.alive = true;
        e.hp = e.maxHp * 0.5;
        e.ph2 = true;
        e.ph2Grace = 1.5;
        e.charging = false;
        e.ghosts = [];
        for (let i = 0; i < 7; i++) {
            e.ghosts.push({ angle: i * Math.PI * 2 / 7, delay: i * 0.2, shootTimer: 0 });
        }
        doNtf('💀 墨大夫进入魔化形态！七鬼噬魂大法！');
        return;
    }
    
    if (e.ph2Grace > 0) return;
    
    e.alive = false; game.bDef = true;
    const ss = 20 + game.curS * 10 + Math.floor(Math.random() * 30); game.spiritStones += ss;
    doNtf('🏆 击败' + e.name + '！经验+' + e.exp + ' 灵石+' + ss);
    gainExp(e.exp); game.sClr = true;
    if (!game.clearedStages.includes(game.curStageId)) game.clearedStages.push(game.curStageId);
    applyChestReward();
    const sd = STAGES.find(s => s.id === game.curStageId);
    const bp = sd ? sd.stage?.boss : null;
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

function spawnBossEnemies(stageId) {
    const sd = STAGES.find(s => s.id === stageId);
    if (!sd || !sd.stage || !sd.stage.boss) return [];
    const bp = sd.stage.boss;
    const dm = DIFF_MULT[game.difficulty];
    const b = {
        x: W / 2, y: TB + (H - TB) / 2,
        type: 'boss', name: bp.name,
        hp: Math.round(bp.hp * (dm.bossHpMul || 1)), maxHp: Math.round(bp.hp * (dm.bossHpMul || 1)),
        atk: Math.round(bp.atk * (dm.bossAtkMul || 1)), size: bp.size,
        exp: bp.exp, alive: true, isBoss: true,
        spd: 30, tm: 0, atkT: 0,
    };
    if (bp.name.includes('墨大夫')) {
        b.ph2 = false; b.ph2Grace = 0; b.charging = false; b.ghosts = [];
    }
    return [b];
}

export function goToHubAfterBoss() {
    if (Math.random() < 0.5) {
        triggerRandomEvent();
    } else {
        game.gameMode = 'hub'; game.hubSel = 0; game.hubMode = 'main';
    }
}

export function updateMoDaifu(e, dt) {
    e.ph2Grace = Math.max(0, (e.ph2Grace || 0) - dt);
    if (e.ph2Grace > 0) e.hp = Math.max(1, e.hp);
    
    const hpPct = e.hp / e.maxHp;
    
    if (!e.ph2 && (hpPct <= 0.1 || e.hp <= 0)) {
        e.ph2 = true;
        e.hp = e.maxHp * 0.5;
        e.ph2Grace = 1.5;
        e.charging = false;
        e.ghosts = [];
        for (let i = 0; i < 7; i++) {
            e.ghosts.push({ angle: i * Math.PI * 2 / 7, delay: i * 0.2, shootTimer: 0 });
        }
        doNtf('💀 墨大夫进入魔化形态！七鬼噬魂大法！');
        return;
    }
    
    if (e.ph2) {
        updateMoDaifuPhase2(e, dt);
        return;
    }
    
    updateMoDaifuPhase1(e, dt);
}

function updateMoDaifuPhase1(e, dt) {
    e.tm = (e.tm || 0) + dt;
    e.atkT = Math.max(0, (e.atkT || 0) - dt);
    e.silverHandCd = Math.max(0, (e.silverHandCd || 0) - dt);
    
    const edx = game.HL.x - e.x, edy = game.HL.y - e.y, ed = Math.hypot(edx, edy);
    
    if (e.charging) {
        e.chargeT += dt;
        const moveDist = e.chSpd * dt;
        e.x += e.chDx * moveDist;
        e.y += e.chDy * moveDist;
        e.chDist += moveDist;
        
        if (!e.chargeHit) {
            const dToPlayer = Math.hypot(game.HL.x - e.x, game.HL.y - e.y);
            if (dToPlayer < e.size + 20) {
                e.chargeHit = true;
                if (game.shieldT <= 0 && game.HL.invT <= 0) {
                    game.hp -= Math.max(1, 25 - getEquipBonus().def);
                    game.psnCnt = 2;
                    game.HL.invT = 0.5;
                    doNtf('⚠ 魔银手！中毒2秒');
                }
                hitFX({ x: game.HL.x, y: game.HL.y });
            }
        }
        
        if (e.chargeT > 0.6 || e.chDist >= e.chMaxDist) {
            e.charging = false;
            e.chargeHit = false;
            e.atkT = 0.5;
            
            game.effects.push({ x: e.x, y: e.y, tp: 'silverHand', life: 0.6, ml: 0.6, sz: e.size });
        }
        return;
    }
    
    const halfMapDist = 400;
    if (e.silverHandCd <= 0 && ed <= halfMapDist) {
        e.silverHandCd = 5;
        e.charging = true;
        e.chargeHit = false;
        e.chargeT = 0;
        e.chSpd = 800;
        e.chDist = 0;
        e.chMaxDist = ed + 50;
        e.chDx = edx / ed;
        e.chDy = edy / ed;
        game.effects.push({ x: e.x, y: e.y, tp: 'silverHandCharge', life: 0.3, ml: 0.3 });
        return;
    }
    
    if (ed > e.size + 8) {
        const spd = e.spd || 25;
        e.x += edx / ed * spd * dt;
        e.y += edy / ed * spd * dt;
    }
    
    if (ed < e.size + 12 && game.HL.invT <= 0 && e.atkT <= 0) {
        if (game.shieldT <= 0) {
            game.hp -= Math.max(1, e.atk - getEquipBonus().def);
            game.HL.invT = 0.5;
        }
        e.atkT = 0.8;
        hitFX({ x: game.HL.x, y: game.HL.y });
    }
}

function updateMoDaifuPhase2(e, dt) {
    e.tm = (e.tm || 0) + dt;
    
    const edx = game.HL.x - e.x, edy = game.HL.y - e.y, ed = Math.hypot(edx, edy);
    
    if (ed > 100) {
        const spd = e.spd || 15;
        e.x += edx / ed * spd * dt;
        e.y += edy / ed * spd * dt;
    }
    
    if (!e.ghosts) {
        e.ghosts = [];
        for (let i = 0; i < 7; i++) {
            e.ghosts.push({ angle: i * Math.PI * 2 / 7, delay: i * 0.2, shootTimer: 0 });
        }
    }
    
    for (const ghost of e.ghosts) {
        ghost.angle += 0.8 * dt;
        ghost.shootTimer += dt;
        
        if (ghost.shootTimer >= 2 + ghost.delay) {
            ghost.shootTimer = 0;
            const gx = e.x + Math.cos(ghost.angle) * 40;
            const gy = e.y + Math.sin(ghost.angle) * 40;
            const ba = Math.atan2(game.HL.y - gy, game.HL.x - gx);
            game.bullets.push({
                x: gx, y: gy,
                vx: Math.cos(ba) * 120,
                vy: Math.sin(ba) * 120,
                life: 3, type: 'ghostSkull',
                dmg: 12
            });
        }
    }
    
    if (Math.hypot(game.HL.x - e.x, game.HL.y - e.y) < e.size + 12 && game.HL.invT <= 0) {
        if (game.shieldT <= 0) {
            game.hp -= Math.max(1, 8 - getEquipBonus().def);
            game.HL.invT = 0.5;
        }
        hitFX({ x: game.HL.x, y: game.HL.y });
    }
}

function getEquipBonus() {
    return { def: 0, manaRegen: 1 };
}
