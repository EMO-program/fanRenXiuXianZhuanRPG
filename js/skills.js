import { SKILLS } from './config.js';
import { game } from './state.js';
import { W, H } from './engine.js';
import { hitFX } from './utils.js';
import { defeatBoss } from './combat.js';
import { onPlayerDealDamage, onEnemyKilled, getTechBonus } from './techniques.js';

export function initOrbitSwords() {
    const target = Math.max(0, Math.min(18, Math.floor(game.swCnt / 4)));
    while (game.orbitSwords.length < target) {
        const i = game.orbitSwords.length;
        const r = 36;
        const a = i * Math.PI * 2 / target;
        game.orbitSwords.push({
            angle: a, state: 'orbit', life: 0,
            x: game.HL.x + Math.cos(a) * r, y: game.HL.y + Math.sin(a) * r,
            vx: 0, vy: 0
        });
    }
    while (game.orbitSwords.length > target) {
        game.orbitSwords.pop();
    }
    if (target > 0 && game.orbitSwords.length === 0) {
        for (let i = 0; i < target; i++) {
            const a = i * Math.PI * 2 / target;
            const r = 36;
            game.orbitSwords.push({
                angle: a, state: 'orbit', life: 0,
                x: game.HL.x + Math.cos(a) * r, y: game.HL.y + Math.sin(a) * r,
                vx: 0, vy: 0
            });
        }
    }
}

export function updateOrbitSwords(dt) {
    const r = 36;
    for (const sw of game.orbitSwords) {
        if (sw.state === 'orbit') {
            sw.angle += 2.5 * dt;
        } else if (sw.state === 'flying') {
            const tb = getTechBonus();
            const speedMul = tb.swordSpdMul || 1;
            sw.x += sw.vx * speedMul * dt;
            sw.y += sw.vy * speedMul * dt;
            sw.life -= dt;
            let hit = false;
            for (const e of game.enemies) {
                if (!e.alive) continue;
                if (Math.hypot(sw.x - e.x, sw.y - e.y) < e.size + 6) {
                    e.hp -= 15; hitFX({ x: e.x, y: e.y }); onPlayerDealDamage(15);
                    if (e.hp <= 0) { if (e.isBoss) defeatBoss(e); else { e.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                    hit = true; break;
                }
            }
            const dist = Math.hypot(sw.x - game.HL.x, sw.y - game.HL.y);
            if (hit || dist > 280 || sw.life <= 0) {
                sw.state = 'returning';
                sw.vx = (game.HL.x - sw.x) * 3;
                sw.vy = (game.HL.y - sw.y) * 3;
            }
        } else if (sw.state === 'returning') {
            const dx = game.HL.x - sw.x, dy = game.HL.y - sw.y;
            const dist = Math.hypot(dx, dy);
            if (dist < r + 8) {
                sw.state = 'orbit';
                sw.angle = Math.atan2(dy, dx);
            } else {
                const spd = 300;
                sw.x += dx / dist * spd * dt;
                sw.y += dy / dist * spd * dt;
            }
            for (const e of game.enemies) {
                if (!e.alive) continue;
                if (Math.hypot(sw.x - e.x, sw.y - e.y) < e.size + 6) {
                    e.hp -= 15; hitFX({ x: e.x, y: e.y }); onPlayerDealDamage(15);
                    if (e.hp <= 0) { if (e.isBoss) defeatBoss(e); else { e.alive = false; game.spiritStones += 1 + Math.floor(Math.random() * 2); onEnemyKilled(); } }
                    break;
                }
            }
        }
    }
}

export function castSkill(skillId) {
    const sk = SKILLS.find(s => s.id === skillId);
    if (!sk) return false;
    if ((game.skillCDs[skillId] || 0) > 0) return false;
    if (game.mana < sk.mana) return false;
    game.mana -= sk.mana;
    game.skillCDs[skillId] = sk.cd;

    if (skillId === 'fireball') {
        game.bullets.push({
            x: game.HL.x + Math.cos(game.HL.fA) * 20,
            y: game.HL.y + Math.sin(game.HL.fA) * 20,
            vx: Math.cos(game.HL.fA) * 320,
            vy: Math.sin(game.HL.fA) * 320,
            life: 1.2, type: 'fireball', dmg: 30
        });
        return true;
    }
    if (skillId === 'flyingSwords') {
        const tb = getTechBonus();
        const sMul = tb.swordSpdMul || 1;
        for (const sw of game.orbitSwords) {
            sw.state = 'flying';
            sw.life = 1.0;
            const an = sw.angle;
            sw.x = game.HL.x + Math.cos(an) * 40;
            sw.y = game.HL.y + Math.sin(an) * 40;
            sw.vx = Math.cos(an) * 380 * sMul;
            sw.vy = Math.sin(an) * 380 * sMul;
        }
        return true;
    }
    if (skillId === 'shield') {
        game.shieldT = 3;
        return true;
    }
    if (skillId === 'greatSword') {
        game.greatSwordT = 20;
        return true;
    }
    return false;
}

export function updateSkillTimers(dt) {
    for (const k in game.skillCDs) {
        game.skillCDs[k] = Math.max(0, game.skillCDs[k] - dt);
        if (game.skillCDs[k] <= 0) delete game.skillCDs[k];
    }
    game.shieldT = Math.max(0, game.shieldT - dt);
    game.greatSwordT = Math.max(0, game.greatSwordT - dt);
}
