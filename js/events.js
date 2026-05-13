import { EVENTS, ITEMS } from './config.js';
import { game } from './state.js';
import { maxHP, maxMana, gainExp, doNtf } from './utils.js';

export function triggerRandomEvent() {
    const unused = EVENTS.filter(ev => !(game.completedEvents || []).includes(ev.id));
    const pool = unused.length > 0 ? unused : EVENTS;
    const ev = pool[Math.floor(Math.random() * pool.length)];
    if (!ev) return;
    game.eventId = ev.id;
    game.eventSel = 0;
    game.gameMode = 'event';
}

export function applyEventResult(choice) {
    const ev = EVENTS.find(e => e.id === game.eventId);
    if (!ev) return;

    const result = choice === 0 ? ev.result1 : ev.result2;

    if (result.risk && Math.random() < result.risk) {
        const dmg = Math.round(maxHP() * 0.25);
        game.hp = Math.max(1, game.hp - dmg);
        doNtf('⚠ 遭遇危险！损失 ' + dmg + ' 生命');
    }

    if (result.stones) game.spiritStones = Math.max(0, game.spiritStones + result.stones);
    if (result.cost) game.spiritStones = Math.max(0, game.spiritStones - result.cost);
    if (result.healPct) game.hp = Math.min(maxHP(), game.hp + maxHP() * result.healPct);
    if (result.mana || result.mana === 0) game.mana = Math.min(maxMana(), game.mana + result.mana);
    if (result.manaPct) game.mana = maxMana();
    if (result.exp) gainExp(result.exp);
    if (result.playerExp) gainExp(result.playerExp);
    if (result.bottle) game.bottleLiquid = Math.min(1, game.bottleLiquid + result.bottle);
    if (result.item) {
        game.inventory[result.item] = (game.inventory[result.item] || 0) + 1;
    }

    if (!game.completedEvents) game.completedEvents = [];
    if (!game.completedEvents.includes(ev.id)) game.completedEvents.push(ev.id);

    doNtf(result.msg || '事件结束');
    game.gameMode = 'hub';
    game.hubMode = 'main';
    game.hubSel = 0;
    game.eventId = null;
}
