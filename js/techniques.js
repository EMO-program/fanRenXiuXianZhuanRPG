import { TECHNIQUES } from './config.js';
import { game } from './state.js';
import { doNtf } from './utils.js';

const RNAME_INDEX = { '炼气': 0, '筑基': 1, '结丹': 2, '元婴': 3, '化神': 4 };

export function getTechBonus() {
    const b = { spdMul: 1, hpMul: 1, regen: 0, manaMul: 1, dmgMul: 1, flatDef: 0, swordSpdMul: 1, lifeSteal: 0 };
    for (const t of TECHNIQUES) {
        const lv = game.techLvs[t.id] || 0;
        if (lv <= 0) continue;
        const tier = t.tiers[lv - 1];
        if (!tier) continue;
        if (t.id === 'smokeStep') b.spdMul += tier.val;
        else if (t.id === 'springVigor') b.hpMul += tier.val;
        else if (t.id === 'elephantArmor') b.flatDef += tier.val;
        else if (t.id === 'azureSword') b.dmgMul += tier.val;
        else if (t.id === 'daYan') b.manaMul += tier.val;
        else if (t.id === 'moYiPoison') b.regen = (b.regen || 0) + tier.val;
        else if (t.id === 'moJiaoBlood') { b.regen = (b.regen || 0) + tier.val; b.dmgMul += (tier.val2 || 0); }
        else if (t.id === 'jinJiaoScale') { b.hpMul += tier.val; b.flatDef += (tier.val2 || 0); }
        else if (t.id === 'tianMingSword') { b.swordSpdMul += tier.val; b.dmgMul += (tier.val2 || 0); }
        else if (t.id === 'yuanShaDemon') { b.dmgMul += tier.val; b.lifeSteal += (tier.val2 || 0); }
        else if (t.id === 'huMoTrue') b.dmgMul += (tier.val2 || 0);
        else if (t.id === 'yuanShaSplit') { b.regen = (b.regen || 0) + tier.val; b.hpMul += tier.val2; b.dmgMul += tier.val2; b.manaMul += tier.val2; }
    }
    return b;
}

export function canLearnTechnique(tech, tierIdx) {
    const tier = tech.tiers[tierIdx];
    if (!tier) return { ok: false, reason: '已满级' };
    const curLv = game.techLvs[tech.id] || 0;
    if (tierIdx !== curLv) return { ok: false, reason: '需逐级修炼' };
    if (tier.lv <= curLv) return { ok: false, reason: '已修炼' };
    if (tech.type === 'boss') {
        if (!game.bossTechs.includes(tech.id)) return { ok: false, reason: '需击败对应Boss解锁' };
    } else {
        const realmIdx = RNAME_INDEX[game.CL.realm] || 0;
        const reqIdx = RNAME_INDEX[tech.realm] || 0;
        if (realmIdx < reqIdx) return { ok: false, reason: '需达到' + tech.realm + '境界' };
    }
    if (game.spiritStones < tier.cost) return { ok: false, reason: '灵石不足(' + tier.cost + ')' };
    return { ok: true };
}

export function learnTechnique(idx) {
    const tech = TECHNIQUES[idx];
    if (!tech) return;
    const curLv = game.techLvs[tech.id] || 0;
    const nextIdx = curLv;
    const result = canLearnTechnique(tech, nextIdx);
    if (!result.ok) { doNtf('⚠ ' + result.reason); return; }
    const tier = tech.tiers[nextIdx];
    game.spiritStones -= tier.cost;
    game.techLvs[tech.id] = nextIdx + 1;
    doNtf('📖 修炼' + tech.name + ' · ' + tier.label + '！');
}

export function onPlayerDealDamage(dmg) {
    if (game.techLvs['yuanShaDemon']) {
        const tier = TECHNIQUES.find(t => t.id === 'yuanShaDemon').tiers[0];
        const steal = (tier && tier.val2) ? tier.val2 : 0.08;
        game.hp = Math.min(maxHP(), game.hp + dmg * steal);
    }
}

export function onEnemyKilled() {
    if (game.techLvs['huMoTrue']) {
        game.mana = Math.min(maxMana(), game.mana + 30);
    }
}
