import { LOOT_TABLES, HERB_BONUS, STAGES } from './config.js';
import { game } from './state.js';
import { doNtf } from './utils.js';

export function rollLoot(enemyType, x, y) {
    const table = LOOT_TABLES[enemyType] || LOOT_TABLES['普通'];
    for (const entry of table) {
        if (Math.random() >= entry.chance) continue;
        if (entry.item === 'stones') {
            const amt = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            if (amt > 0) {
                game.spiritStones += amt;
                doNtf('💎 +' + amt + '灵石');
            }
        } else {
            game.inventory[entry.item] = (game.inventory[entry.item] || 0) + 1;
            doNtf('📦 获得 ' + entry.item);
        }
    }
    const sd = STAGES.find(s => s.id === game.curStageId);
    if (sd && sd.dropQX && Math.random() < 0.05) {
        game.inventory['升仙令'] = (game.inventory['升仙令'] || 0) + 1;
        doNtf('🪪 获得关键道具：升仙令');
    }
    if (sd && sd.id.startsWith('lx') && Math.random() < 0.01) {
        game.inventory['养魂木'] = (game.inventory['养魂木'] || 0) + 1;
        doNtf('🪵 获得稀有道具：养魂木');
    }
}

export function rollHerbBonus() {
    for (const entry of HERB_BONUS) {
        if (Math.random() >= entry.chance) continue;
        if (entry.item === 'stones') {
            const amt = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            if (amt > 0) {
                game.spiritStones += amt;
                doNtf('💎 额外获得 +' + amt + '灵石');
            }
        } else {
            game.inventory[entry.item] = (game.inventory[entry.item] || 0) + 1;
            doNtf('📦 额外获得 ' + entry.item);
        }
    }
}
