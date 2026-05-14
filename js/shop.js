import { SHOP_ITEMS } from './config.js';
import { game } from './state.js';
import { maxHP, maxMana, doNtf, gainExp } from './utils.js';
import { H } from './engine.js';

function autoScrollShop() {
    const sel = game.shopSel, itemH = 56, oy = 80, viewH = H - oy - 36;
    const maxScroll = Math.max(0, (sel + 1) * itemH - viewH);
    let sy = game.shopScrollY || 0;
    const top = sel * itemH, bot = top + itemH;
    if (top < sy) sy = top;
    else if (bot > sy + viewH) sy = bot - viewH;
    game.shopScrollY = Math.max(0, Math.min(maxScroll, sy));
}

export function buyItem(idx) {
    const item = SHOP_ITEMS[idx];
    if (!item) return;
    if (game.spiritStones < item.price) { doNtf('💎 灵石不足！需要 ' + item.price); return; }
    game.spiritStones -= item.price;
    const fx = item.fx, val = item.val;
    if (fx === 'heal') { game.hp = Math.min(game.hp + maxHP() * val, maxHP()); doNtf('🛒 购买 ' + item.name + '！恢复生命'); }
    else if (fx === 'exp') { gainExp(Math.round(game.CL.expToNext * val)); doNtf('🛒 购买 ' + item.name + '！获得经验'); }
    else if (fx === 'atk') { game.atkBuf = val; doNtf('🛒 购买 ' + item.name + '！攻击提升 ' + val + '秒'); }
    else if (fx === 'mana') { game.mana = maxMana(); doNtf('🛒 购买 ' + item.name + '！法力全满'); }
    else if (fx === 'swdUp') { game.swCnt = Math.min(72, game.swCnt + val); doNtf('🛒 购买 ' + item.name + '！飞剑+' + val); }
    else if (fx === 'poison') { game.psnCnt = val; doNtf('🛒 购买 ' + item.name + '！毒素生效'); }
}

export function enterShop(from) {
    game.gameMode = 'shop';
    game.shopFrom = from || 'cave';
    game.shopSel = 0;
    game.shopScrollY = 0;
}

export function updateShop(dt, L) {
    if (L.input.justPressed('menu_esc')) {
        game.gameMode = game.shopFrom || 'cave';
        return;
    }
    if (L.input.justPressed('menu_up') || L.input.justPressed('up')) {
        game.shopSel = Math.max(0, game.shopSel - 1);
        autoScrollShop();
    }
    if (L.input.justPressed('menu_down') || L.input.justPressed('down')) {
        game.shopSel = Math.min(SHOP_ITEMS.length - 1, game.shopSel + 1);
        autoScrollShop();
    }
    if (L.input.justPressed('menu_enter')) {
        buyItem(game.shopSel);
    }
}
