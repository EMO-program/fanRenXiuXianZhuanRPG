import { EQUIPMENT, EQUIP_SLOTS } from './config.js';
import { game } from './state.js';
import { doNtf } from './utils.js';

export function getEquipBonus() {
    const b = { atk: 0, hp: 0, def: 0, manaRegen: 1, hpMul: 1 };
    for (const slot of EQUIP_SLOTS) {
        const id = game.eSlots[slot];
        const list = EQUIPMENT[slot];
        const item = list.find(it => it.id === id);
        if (!item) continue;
        if (item.atk) b.atk += item.atk;
        if (item.hp) b.hp += item.hp;
        if (item.def) b.def += item.def;
        if (item.manaRegen) b.manaRegen = item.manaRegen;
        if (item.hpMul) b.hpMul = 1 + item.hpMul;
    }
    return b;
}

export function buyEquip(slot, idx) {
    const list = EQUIPMENT[slot];
    const item = list[idx];
    if (item.owned) {
        game.eSlots[slot] = item.id;
        doNtf('✓ 装备 ' + item.name);
        return;
    }
    if (game.spiritStones < item.price) {
        doNtf('💎 灵石不足！需要 ' + item.price + ' 灵石');
        return;
    }
    game.spiritStones -= item.price;
    item.owned = true;
    game.eSlots[slot] = item.id;
    doNtf('🛒 购买并装备 ' + item.name);
}

export function enterEquipment() {
    game.gameMode = 'equipment';
    game.eSelSlot = 0;
    game.eSelItem = 0;
}

export function updateEquipment(dt, L) {
    if (L.input.justPressed('menu_esc')) {
        game.gameMode = 'cave';
        return;
    }
    if (L.input.justPressed('menu_up') || L.input.justPressed('up')) {
        game.eSelItem = 0;
        game.eSelSlot = Math.max(0, game.eSelSlot - 1);
    }
    if (L.input.justPressed('menu_down') || L.input.justPressed('down')) {
        game.eSelItem = 0;
        game.eSelSlot = Math.min(EQUIP_SLOTS.length - 1, game.eSelSlot + 1);
    }
    if (L.input.justPressed('menu_left')) {
        game.eSelItem = Math.max(0, game.eSelItem - 1);
    }
    if (L.input.justPressed('menu_right')) {
        const list = EQUIPMENT[EQUIP_SLOTS[game.eSelSlot]];
        game.eSelItem = Math.min(list.length - 1, game.eSelItem + 1);
    }
    if (L.input.justPressed('menu_enter')) {
        buyEquip(EQUIP_SLOTS[game.eSelSlot], game.eSelItem);
    }
}
