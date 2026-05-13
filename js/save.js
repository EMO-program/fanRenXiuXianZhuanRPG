import { game } from './state.js';
import { EQUIPMENT, EQUIP_SLOTS, STAGES, rsName } from './config.js';

const SAVE_PREFIX = 'pw_slot_';
const MAX_SLOTS = 10;

function packData() {
    return {
        hp: game.hp, mana: game.mana,
        CL: { realm: game.CL.realm, stage: game.CL.stage, exp: game.CL.exp, expToNext: game.CL.expToNext, breakRdy: game.CL.breakRdy },
        curS: game.curS, totWv: game.totWv, bSp: game.bSp, bDef: game.bDef, sClr: game.sClr,
        spiritStones: game.spiritStones,
        inventory: { ...game.inventory },
        cavePlots: game.cavePlots.map(p => ({ planted: p.planted, gr: p.gr, watered: p.watered, unlocked: p.unlocked, waterCooldown: p.waterCooldown })),
        eSlots: { ...game.eSlots },
        bottleLiquid: game.bottleLiquid,
        swCnt: game.swCnt,
        difficulty: game.difficulty,
        clearedStages: [...(game.clearedStages || [])],
        techLvs: { ...(game.techLvs || {}) },
        bossTechs: [...(game.bossTechs || [])],
        completedEvents: [...(game.completedEvents || [])],
        timestamp: Date.now(),
        version: 3
    };
}

export function saveToSlot(idx) {
    const d = packData();
    try { localStorage.setItem(SAVE_PREFIX + idx, JSON.stringify(d)); }
    catch (e) { /* storage full */ }
}

export function loadSlot(idx) {
    try {
        const raw = localStorage.getItem(SAVE_PREFIX + idx);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

export function deleteSlot(idx) {
    try { localStorage.removeItem(SAVE_PREFIX + idx); } catch (e) { }
}

export function getAllSlots() {
    const slots = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
        const d = loadSlot(i);
        if (d) {
            const rn = rsName(d.CL.realm, d.CL.stage);
            const sn = (d.curS >= 0 && d.curS < STAGES.length) ? STAGES[d.curS].name : '未知';
            const time = formatTime(d.timestamp);
            slots.push({ idx: i, data: d, realm: rn, stageName: sn, time });
        } else {
            slots.push({ idx: i, data: null, realm: '', stageName: '', time: '' });
        }
    }
    return slots;
}

function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function hasAnySave() {
    for (let i = 0; i < MAX_SLOTS; i++) {
        if (loadSlot(i)) return true;
    }
    return false;
}

export function applySave(d) {
    game.hp = d.hp; game.mana = d.mana;
    game.CL.realm = d.CL.realm; game.CL.stage = d.CL.stage; game.CL.exp = d.CL.exp; game.CL.expToNext = d.CL.expToNext; game.CL.breakRdy = d.CL.breakRdy;
    game.curS = d.curS; game.totWv = d.totWv; game.bSp = d.bSp; game.bDef = d.bDef; game.sClr = d.sClr;
    game.spiritStones = d.spiritStones;
    game.inventory = { ...d.inventory };
    game.bottleLiquid = d.bottleLiquid || 0;
    game.swCnt = d.swCnt;
    game.difficulty = d.difficulty || '普通';
    game.clearedStages = d.clearedStages ? [...d.clearedStages] : [];
    game.techLvs = d.techLvs ? { ...d.techLvs } : {};
    game.bossTechs = d.bossTechs ? [...d.bossTechs] : [];
    game.completedEvents = d.completedEvents ? [...d.completedEvents] : [];
    game.eSlots = { ...d.eSlots };
    for (let i = 0; i < game.cavePlots.length && i < d.cavePlots.length; i++) {
        game.cavePlots[i].planted = d.cavePlots[i].planted;
        game.cavePlots[i].gr = d.cavePlots[i].gr;
        game.cavePlots[i].watered = d.cavePlots[i].watered;
        game.cavePlots[i].unlocked = d.cavePlots[i].unlocked;
        game.cavePlots[i].waterCooldown = d.cavePlots[i].waterCooldown || 0;
    }
    for (const slot of EQUIP_SLOTS) {
        const list = EQUIPMENT[slot];
        const curId = game.eSlots[slot];
        for (const item of list) {
            item.owned = (item.id === curId) || (item.price === 0);
        }
    }
}
