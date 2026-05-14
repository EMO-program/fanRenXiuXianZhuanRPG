import { ITEMS } from './config.js';
import { game } from './state.js';
import { maxHP, maxMana, doNtf, gainExp } from './utils.js';
import { W, H } from './engine.js';

function autoScrollInv() {
    const sel = game.invSel, itemH = 50, oy = 80, viewH = H - oy - 36;
    const maxScroll = Math.max(0, (sel + 1) * itemH - viewH);
    let sy = game.invScrollY || 0;
    const top = sel * itemH, bot = top + itemH;
    if (top < sy) sy = top;
    else if (bot > sy + viewH) sy = bot - viewH;
    game.invScrollY = Math.max(0, Math.min(maxScroll, sy));
}

export function useItem(name) {
    const item = ITEMS[name];
    if (!item || !game.inventory[name] || game.inventory[name] <= 0) return;
    game.inventory[name]--;
    if (game.inventory[name] <= 0) delete game.inventory[name];
    const fx = item.fx, val = item.val;
    if (fx === 'heal') { game.hp = Math.min(game.hp + maxHP() * val, maxHP()); doNtf('🧪 使用 ' + name + '！恢复生命'); }
    else if (fx === 'exp') { gainExp(Math.round(game.CL.expToNext * val)); doNtf('🧪 使用 ' + name + '！获得经验'); }
    else if (fx === 'atk') { game.atkBuf = val; doNtf('🧪 使用 ' + name + '！攻击提升 ' + val + '秒'); }
    else if (fx === 'mana') { game.mana = maxMana(); doNtf('🧪 使用 ' + name + '！法力全满'); }
    else if (fx === 'swdUp') { game.swCnt = Math.min(72, game.swCnt + val); doNtf('🧪 使用 ' + name + '！飞剑+' + val); }
    else if (fx === 'poison') { game.psnCnt = val; doNtf('🧪 使用 ' + name + '！毒素生效'); }
}

export function enterInventory(from) {
    game.gameMode = 'inventory';
    game.inventoryFrom = from || 'cave';
    game.invSel = 0;
    game.invScrollY = 0;
}

export function updateInventory(dt, L) {
    if (L.input.justPressed('menu_esc')) {
        game.gameMode = game.inventoryFrom;
        return;
    }
    const keys = Object.keys(game.inventory);
    if (keys.length === 0) { return; }
    if (L.input.justPressed('menu_up') || L.input.justPressed('up')) {
        game.invSel = Math.max(0, game.invSel - 1);
        autoScrollInv();
    }
    if (L.input.justPressed('menu_down') || L.input.justPressed('down')) {
        game.invSel = Math.min(keys.length - 1, game.invSel + 1);
        autoScrollInv();
    }
    if (L.input.justPressed('menu_enter')) {
        useItem(keys[game.invSel]);
    }
}
