import { MAX_PLOTS, PLOT_W, PLOT_H, GARDEN_COLS, GARDEN_OX, GARDEN_OY } from './config.js';

export const game = {
    HL: { x: 400, y: 270, spd: 220, fA: 0, wA: 0, mv: false, invT: 0, anim: { st: 'idle', tm: 0, wf: 0, atkT: 0, cd: 0, hit: false, swS: 0, swL: 0 } },
    CL: { realm: '炼气', stage: 1, exp: 0, expToNext: 60, breakRdy: false },
    enemies: [], bullets: [], particles: [], effects: [],
    hp: 45, mana: 82,
    sA: 0, swCnt: 12, atkBuf: 0, psnCnt: 0,
    curS: 0, sWv: 0, totWv: 0, bSp: false, bDef: false, sClr: false,
    waveReady: false, inventoryFrom: 'cave',
    ntf: '', ntfT: 0, gameOver: false,
    gameMode: 'battle',
    titleSel: 0,
    titleMode: 'main',
    difficulty: '普通',
    clearedStages: [],
    paused: false,
    pauseMenuSel: 0,
    herbsGot: {}, inventory: {}, bottleLiquid: 0, bottleGlowT: 0, diedEnterCave: false, spiritStones: 0,
    cavePlots: [],
    gHL: { x: 400, y: 400, spd: 140, fA: 0, wA: 0, mv: false, anim: { st: 'idle', tm: 0, wf: 0 }, facing: 1 },
    gInteract: 0, herbMenuOpen: false, herbMenuSel: 0, herbMenuPlot: -1,
    eSlots: { 武器: 'w0', 护甲: 'a0', 法宝: 't0' },
    eSelSlot: 0, eSelItem: 0, invSel: 0,
    skillCDs: {},
    shieldT: 0,
    greatSwordT: 0,
    orbitSwords: [],
    shopSel: 0,
    shopFrom: 'cave',
    hubSel: 0,
    hubMode: 'main',
    techSel: 0,
    techLvs: {},
    bossTechs: [],
    eventId: null,
    eventSel: 0,
    completedEvents: [],
    dialogueLines: [],
    dialogueIdx: 0,
    dialogueMode: '',
    saveSel: 0,
    saveConfirm: -1,
    saveMode: '',
    tribTimer: 0, tribBoltCD: 0, tribBolts: [], tribSurviveT: 0,
    tribPending: false
};

for (let i = 0; i < MAX_PLOTS; i++) {
    const r = Math.floor(i / GARDEN_COLS), c = i % GARDEN_COLS;
    game.cavePlots.push({ x: GARDEN_OX + c * (PLOT_W + 16), y: GARDEN_OY + r * (PLOT_H + 30), planted: null, gr: 0, watered: false, waterAnm: 0, waterCooldown: 0, unlocked: i < 2 });
}
