// ===== 难度配置 =====
export const DIFFICULTIES = ['简单', '普通', '困难', '地狱'];
export const DIFF_MULT = {
    简单: { playerHpMul: 1.3, playerAtkMul: 1.2, playerManaMul: 1.2, enemyHpMul: 0.7, enemySpdMul: 0.7, enemyAtkMul: 0.6, bossHpMul: 0.75, bossAtkMul: 0.7 },
    普通: { playerHpMul: 1, playerAtkMul: 1, playerManaMul: 1, enemyHpMul: 1, enemySpdMul: 1, enemyAtkMul: 1, bossHpMul: 1, bossAtkMul: 1 },
    困难: { playerHpMul: 0.8, playerAtkMul: 0.85, playerManaMul: 0.85, enemyHpMul: 1.4, enemySpdMul: 1.3, enemyAtkMul: 1.4, bossHpMul: 1.5, bossAtkMul: 1.4 },
    地狱: { playerHpMul: 0.5, playerAtkMul: 0.7, playerManaMul: 0.7, enemyHpMul: 2, enemySpdMul: 1.7, enemyAtkMul: 2, bossHpMul: 2.5, bossAtkMul: 2 },
};

// ===== 境界配置 =====
export const REALMS = {
    炼气: { maxS: 13, atk: 8, hp: 40, mana: 80 },
    筑基: { maxS: 3, atk: 25, hp: 120, mana: 150 },
    结丹: { maxS: 3, atk: 60, hp: 250, mana: 250 },
    元婴: { maxS: 3, atk: 120, hp: 500, mana: 400 },
    化神: { maxS: 1, atk: 250, hp: 1000, mana: 600 }
};
// ===== 天劫配置 =====
export const TRIBULATION = {
    筑基: { duration: 10, boltSpd: 280, boltDmg: 12, boltGap: 0.3, boltsPer: 1 },
    结丹: { duration: 13, boltSpd: 340, boltDmg: 20, boltGap: 0.25, boltsPer: 2 },
    元婴: { duration: 15, boltSpd: 400, boltDmg: 30, boltGap: 0.2, boltsPer: 2 },
    化神: { duration: 18, boltSpd: 460, boltDmg: 45, boltGap: 0.15, boltsPer: 3 },
};

// ===== 技能配置 =====
export const SKILLS = [
    { id: 'fireball', name: '火球术', mana: 15, cd: 2, desc: '向鼠标方向射出火球', keys: ['Digit1'], cl: '#ff6030' },
    { id: 'flyingSwords', name: '飞剑术', mana: 40, cd: 8, desc: '周身飞剑齐射', keys: ['Digit2'], cl: '#40c060' },
    { id: 'shield', name: '金刚罩', mana: 30, cd: 10, desc: '3秒内无敌', keys: ['Digit3'], cl: '#ffd700' },
    { id: 'greatSword', name: '巨剑术', mana: 50, cd: 25, desc: '剑化3倍·20秒·伤害范围大增', keys: ['Digit4'], cl: '#ff8040' },
];
export const RNAMES = ['炼气', '筑基', '结丹', '元婴', '化神'];
export const S3 = ['初期', '中期', '后期'];

export function rsName(r, s) {
    return r === '炼气' ? r + '·' + s + '层' : r + '·' + S3[Math.min(s - 1, 2)];
}
export function rsStats(r, s) {
    const rd = REALMS[r];
    if (r === '炼气') {
        const t = s / 13;
        return { atk: Math.round(8 + t * 12), hp: Math.round(40 + t * 60), mana: Math.round(80 + t * 20) };
    }
    const st = (s - 1) / (rd.maxS - 1 || 1);
    return {
        atk: Math.round(rd.atk + rd.atk * 0.8 * st),
        hp: Math.round(rd.hp + rd.hp * 0.6 * st),
        mana: Math.round(rd.mana + rd.mana * 0.5 * st)
    };
}

// ===== 关卡配置 =====
export const STAGES = [
    { name: '七玄门', sub: '初入修仙', env: '#1a2a10', env2: '#0a1a08', waves: 5, boss: { name: '墨大夫（莫居仁）', hp: 80, atk: 8, size: 24, exp: 200,
      pre: [
        { speaker: 'narr', text: '韩立穿过七玄门密道，推开一扇厚重的铁门。昏暗的密室中，墨大夫负手而立，背对着门口。' },
        { speaker: 'boss', text: '韩立，你终于来了。为师等你很久了。' },
        { speaker: 'boss', text: '你一定很好奇，为何为师一介凡人之躯，却能在这七玄门中呼风唤雨吧？' },
        { speaker: 'boss', text: '老夫墨居仁，本是岚州一散修，因修炼毒功伤了根基，肉身日渐衰朽。' },
        { speaker: 'boss', text: '长春功，乃是专门为夺舍而准备的功法。这些年来为师悉心传授于你，为的便是今日——取你这具年轻的身体，再续仙路！' },
        { speaker: 'boss', text: '不要怪为师心狠。修仙之路，本就是弱肉强食。来吧，让为师看看你这些年究竟学了多少本事！' }
      ],
      post: [
        { speaker: 'narr', text: '墨大夫口吐鲜血，颓然倒地。他挣扎着抬起头，脸上闪过一丝不甘，旋即化为释然的苦笑。' },
        { speaker: 'boss', text: '好...好小子...咳咳...为师确实...小看你了...' },
        { speaker: 'boss', text: '人生苦短，终归尘土。凭什么仙家就可以遨游天地，而我等凡人只能做这井底之蛙...' },
        { speaker: 'boss', text: '韩立...这世间多少好景色，你就...代为师去看看吧...' },
        { speaker: 'narr', text: '言罢，气绝。一卷泛黄手札从袖中滑落——墨大夫毕生的毒术与医术心得。' }
      ] } },
    { name: '血色禁地', sub: '墨蛟之窟', env: '#1a0a0a', env2: '#0a0505', waves: 7, boss: { name: '墨蛟', hp: 200, atk: 18, size: 30, exp: 500,
      pre: [
        { speaker: 'narr', text: '血色禁地深处，腥风扑面。洞窟深处盘踞着一头身长十余丈的漆黑蛟龙，双眼如同两盏血红灯笼。' },
        { speaker: 'boss', text: '人类修士...胆敢闯入本座的巢穴...' },
        { speaker: 'boss', text: '此处乃上古龙族埋骨之地，你脚下的每一寸泥土都浸染着龙血。千年以来，你是第二个活着走到这里的人。' },
        { speaker: 'boss', text: '第一个已是百年前的事了，他的血肉让本座沉睡了百年。如今，你也来做本座的血食吧！' }
      ],
      post: [
        { speaker: 'narr', text: '墨蛟庞大的身躯轰然倒塌，黑血汩汩流出，蛟目中猩红的光芒逐渐熄灭。' },
        { speaker: 'boss', text: '想不到...本座修行八百载...竟败在一个炼气期修士手中...' },
        { speaker: 'narr', text: '蛟尸旁，一颗龙眼大小的墨色蛟丹微微发光，散发着浓郁的灵力。' }
      ] } },
    { name: '黄风谷', sub: '妖兽横行', env: '#1a1a0a', env2: '#0a0a05', waves: 8, boss: { name: '金蛟', hp: 350, atk: 30, size: 28, exp: 800,
      pre: [
        { speaker: 'narr', text: '黄风谷狂风怒号，飞沙走石。悬崖之上，一条通体金黄的蛟龙盘踞于怪石之间，竖瞳中透着古老的威严。' },
        { speaker: 'boss', text: '修士，停下脚步。你身上有墨蛟一族的气息...看来我那不成器的族弟已经死在你手上了。' },
        { speaker: 'boss', text: '我金蛟一族被囚于此谷已三千年，便是为了守护这谷中的上古遗宝。历代闯入者，无一生还。' },
        { speaker: 'boss', text: '你若能击败我，遗宝自可拿去。但你若败了，便化作这谷中的黄土吧。' }
      ],
      post: [
        { speaker: 'narr', text: '金蛟的金色鳞甲片片碎裂，它仰天长啸，声震四野，庞大的身躯缓缓倒下。' },
        { speaker: 'boss', text: '三千年...终于解脱了...多谢你，修士...遗宝就在谷底石碑之后...' },
        { speaker: 'narr', text: '金蛟化作漫天金光散去，唯有一枚逆鳞飘落掌心——温热，如同心跳。' }
      ] } },
    { name: '乱星海', sub: '虚天殿', env: '#0a0a1a', env2: '#05050a', waves: 10, boss: { name: '万天明', hp: 600, atk: 50, size: 26, exp: 1400,
      pre: [
        { speaker: 'narr', text: '虚天殿深处阴风阵阵，一个枯瘦的身影端坐于白骨王座之上。正是天煞宗宗主——万天明。' },
        { speaker: 'boss', text: '呵呵...又来一个不知死活的小辈。你可知道，乱星海是什么地方？' },
        { speaker: 'boss', text: '这里是正魔两道之外的无法之地，能在乱星海立足的，哪一个手上不是沾满了鲜血？' },
        { speaker: 'boss', text: '老夫在这虚天殿中修炼百年，已将天煞真经炼至大成。韩立，今日便是你的死期！' }
      ],
      post: [
        { speaker: 'narr', text: '万天明的骨杖断为两截，他跪倒在地，天煞魔气如潮水般四散。' },
        { speaker: 'boss', text: '老夫纵横乱星海百余年...想不到竟败在一个结丹小辈手上...' },
        { speaker: 'boss', text: '韩立...虚天殿的传承你可以拿去。但你记住——杀了天煞宗宗主，整个乱星海的魔道修士都不会放过你...' },
        { speaker: 'narr', text: '万天明的身影化作一缕黑烟，消散在虚天殿的幽暗之中。' }
      ] } },
    { name: '坠魔谷', sub: '魔气滔天', env: '#0a1a1a', env2: '#050a0a', waves: 12, boss: { name: '元刹圣祖', hp: 1000, atk: 80, size: 32, exp: 2400,
      pre: [
        { speaker: 'narr', text: '坠魔谷深处，魔气浓郁得几乎凝成实质。一尊巨大的魔影从深渊中缓缓浮起，周身缭绕着漆黑的魔焰。' },
        { speaker: 'boss', text: '哈哈哈哈哈！多少年了？终于有人能走到这里来！' },
        { speaker: 'boss', text: '本座乃古魔界元刹圣祖的一缕分神，被上古修士封印在此。如今封印松动，正是本座重见天日之时！' },
        { speaker: 'boss', text: '小辈，你身上的灵力虽然微薄，倒也纯净。献出你的元婴，本座可以让你少受些痛苦。' },
        { speaker: 'boss', text: '不识抬举！也罢，就用你的血肉来祭本座的魔功，庆祝这万年之后的重生！' }
      ],
      post: [
        { speaker: 'narr', text: '元刹圣祖的魔躯崩裂，他的元神在虚空中扭曲咆哮，魔气四散奔涌。' },
        { speaker: 'boss', text: '不——不可能！本座堂堂古魔，怎会败给一个下界的小修士！！' },
        { speaker: 'boss', text: '韩立——你给本座记住！封印未解，这只是本座一缕分神而已。待本座真身脱困之日，便是你的死期！' },
        { speaker: 'narr', text: '话音未落，坠魔谷的封印之力将残魂吸入深渊。一切归于寂静，唯余魔气缓缓消散。' }
      ] } },
    { name: '玄天殿', sub: '仙魔交锋', env: '#1a0a1a', env2: '#0a050a', waves: 14, boss: { name: '呼老魔', hp: 1600, atk: 120, size: 30, exp: 4000,
      pre: [
        { speaker: 'narr', text: '玄天殿中，一位身披黑袍的老者端坐于大殿中央。周身萦绕着浓郁如墨的魔气，气息深沉得令人窒息。' },
        { speaker: 'boss', text: '哦？又有人来了...老夫在此枯坐三百年，骨头都快生锈了。' },
        { speaker: 'boss', text: '老夫姓呼，世人都叫我呼老魔。三百年前我以一己之力屠灭正道三宗，被尊为魔道第一人。' },
        { speaker: 'boss', text: '小子，你身上似乎有几分大衍诀的气息...哼，若非老夫当年被那大衍神君暗算，怎会被困于此！' },
        { speaker: 'boss', text: '来吧！让老夫看看，你比三百年前的那些正道修士，强了多少！' }
      ],
      post: [
        { speaker: 'narr', text: '呼老魔的魔气终于散尽，苍老的面容首次露出平和之色。' },
        { speaker: 'boss', text: '三百年...终于可以歇歇了...小子，你叫什么名字？' },
        { speaker: 'han', text: '晚辈韩立。' },
        { speaker: 'boss', text: '韩立...好名字。你可知老夫最后悔的是什么？不是败给大衍神君，而是这一生，杀伐太重，忘了修道本心...' },
        { speaker: 'narr', text: '呼老魔合上双眼，身躯化为漫天飞灰，一本泛黄的大衍诀心得掉落出来。' }
      ] } },
    { name: '昆吾山', sub: '镇魔塔', env: '#0a0a0a', env2: '#050505', waves: 16, boss: { name: '元刹圣祖分魂', hp: 3000, atk: 200, size: 36, exp: 10000,
      pre: [
        { speaker: 'narr', text: '昆吾山顶，镇魔塔轰然崩塌。一尊漆黑如墨的巨大魔影破塔而出，滔天魔气遮天蔽日。' },
        { speaker: 'boss', text: '韩立...我们又见面了。坠魔谷一别，本座可是时时刻刻都在念着你啊。' },
        { speaker: 'boss', text: '这是本座最强大的分魂，与昆吾山地脉相连。坠魔谷那次，你不过是胜了本座一缕残魂而已。' },
        { speaker: 'boss', text: '镇魔塔困了我百年——如今此塔已碎，整个昆吾山的地脉之力都在本座的掌控之中！' },
        { speaker: 'boss', text: '今日，便让你见识见识，真正的古魔之力！这一次，再没有封印可以救你！' }
      ],
      post: [
        { speaker: 'narr', text: '元刹圣祖的分魂彻底溃散，漫天黑雾被昆吾山的天地灵气逐渐净化，化作虚无。' },
        { speaker: 'boss', text: '不——这不可能——本座与地脉相连——怎会被区区一个下界修士——' },
        { speaker: 'narr', text: '虚空中传来元刹圣祖最后的哀嚎。一缕极其精纯的魂力自崩溃的魔气中逸出，飘入你的体内——这是古魔万年修为的精华所化。' }
      ] } },
];

// ===== 灵草配置 =====
export const HERBS = {
    黄龙草: { gr: 3, yield: '培元丹', desc: '恢复30%生命', fx: 'heal', val: 30, cl: '#c8b040' },
    升仙果: { gr: 5, yield: '凝元丹', desc: '+60%境界经验', fx: 'exp', val: 60, cl: '#ff8090' },
    血灵草: { gr: 4, yield: '血灵丹', desc: '攻击+50% 30秒', fx: 'atk', val: 50, cl: '#d04040' },
    金雷竹: { gr: 8, yield: '金雷竹材', desc: '飞剑+4', fx: 'swdUp', val: 1, cl: '#40c040' },
    回灵花: { gr: 3, yield: '回灵丹', desc: '恢复全部法力', fx: 'mana', val: 100, cl: '#6080ff' },
    阴凝草: { gr: 5, yield: '毒丹', desc: '敌人持续毒伤', fx: 'poison', val: 10, cl: '#6040a0' }
};
export const HLIST = Object.keys(HERBS);

// ===== 灵田配置 =====
export const MAX_PLOTS = 10;
export const PLOT_COSTS = [0, 0, 20, 50, 100, 200, 400, 800, 1600, 3200];
export const PLOT_W = 70, PLOT_H = 55;
// ===== 道具配置 =====
export const ITEMS = {
    培元丹: { desc: '恢复30%生命', fx: 'heal', val: 0.3, cl: '#c8b040' },
    凝元丹: { desc: '+60%境界经验', fx: 'exp', val: 0.6, cl: '#ff8090' },
    血灵丹: { desc: '攻击+50% 30秒', fx: 'atk', val: 50, cl: '#d04040' },
    金雷竹材: { desc: '飞剑+4', fx: 'swdUp', val: 4, cl: '#40c040' },
    回灵丹: { desc: '恢复全部法力', fx: 'mana', val: 100, cl: '#6080ff' },
    毒丹: { desc: '敌人持续毒伤', fx: 'poison', val: 10, cl: '#6040a0' },
};

// ===== 灵田配置 =====
export const GARDEN_COLS = 5, GARDEN_OX = 90, GARDEN_OY = 100;

// ===== 装备配置 =====
export const EQUIP_SLOTS = ['武器', '护甲', '法宝'];
export const EQUIPMENT = {
    武器: [
        { id: 'w0', name: '凡铁剑', atk: 3, price: 0, desc: '普通铁剑', owned: true },
        { id: 'w1', name: '青竹剑', atk: 8, price: 30, desc: '竹制灵剑，攻击+8', owned: false },
        { id: 'w2', name: '金雷剑', atk: 15, price: 120, desc: '金雷之力，攻击+15', owned: false }
    ],
    护甲: [
        { id: 'a0', name: '粗布衣', hp: 20, def: 0, price: 0, desc: '普通布衣', owned: true },
        { id: 'a1', name: '灵丝甲', hp: 50, def: 3, price: 50, desc: '灵丝编织，减伤3', owned: false },
        { id: 'a2', name: '玄龟甲', hp: 100, def: 8, price: 200, desc: '玄龟壳制，减伤8', owned: false }
    ],
    法宝: [
        { id: 't0', name: '无', desc: '暂无法宝', price: 0, owned: true },
        { id: 't1', name: '聚灵珠', manaRegen: 2, price: 40, desc: '法力恢复翻倍', owned: false },
        { id: 't2', name: '护心镜', hpMul: 0.3, price: 80, desc: '最大生命+30%', owned: false }
    ]
};

// ===== 商店配置 =====
const QY = '培元丹', NYD = '凝元丹', XLD = '血灵丹', HLD = '回灵丹', DD = '毒丹', JZ = '金雷竹材';
export const SHOP_ITEMS = [
    { id: 'potion_hp', name: QY, desc: '恢复30%生命', price: 15, cl: '#c8b040', fx: 'heal', val: 0.3 },
    { id: 'potion_mp', name: HLD, desc: '恢复全部法力', price: 20, cl: '#6080ff', fx: 'mana', val: 100 },
    { id: 'potion_exp', name: NYD, desc: '+60%境界经验', price: 20, cl: '#ff8090', fx: 'exp', val: 0.6 },
    { id: 'potion_atk', name: XLD, desc: '攻击+50%·30秒', price: 25, cl: '#d04040', fx: 'atk', val: 30 },
    { id: 'potion_psn', name: DD, desc: '敌人持续毒伤', price: 20, cl: '#6040a0', fx: 'poison', val: 10 },
    { id: 'sword_piece', name: JZ, desc: '飞剑上限+4', price: 40, cl: '#40c040', fx: 'swdUp', val: 4 },
];

// ===== 功法配置 =====
export const TECHNIQUES = [
    { id: 'smokeStep', name: '罗烟步', desc: '移动速度', realm: '炼气', type: 'base', cl: '#80d0ff',
      tiers: [
        { lv: 1, cost: 25, val: 0.08, label: '第一重·+8%' },
        { lv: 2, cost: 60, val: 0.18, label: '第二重·+18%' },
        { lv: 3, cost: 140, val: 0.30, label: '第三重·+30%' },
      ] },
    { id: 'springVigor', name: '回春功', desc: '最大生命', realm: '炼气', type: 'base', cl: '#60d060',
      tiers: [
        { lv: 1, cost: 30, val: 0.12, label: '第一重·+12%' },
        { lv: 2, cost: 70, val: 0.28, label: '第二重·+28%' },
        { lv: 3, cost: 150, val: 0.50, label: '第三重·+50%' },
      ] },
    { id: 'elephantArmor', name: '象甲功', desc: '减伤', realm: '炼气', type: 'base', cl: '#a08060',
      tiers: [
        { lv: 1, cost: 25, val: 1, label: '第一重·-1伤害' },
        { lv: 2, cost: 60, val: 2, label: '第二重·-2伤害' },
        { lv: 3, cost: 120, val: 3, label: '第三重·-3伤害' },
      ] },
    { id: 'azureSword', name: '青元剑诀', desc: '攻击与飞剑伤害', realm: '筑基', type: 'base', cl: '#40c0ff',
      tiers: [
        { lv: 1, cost: 40, val: 0.15, label: '第一重·+15%' },
        { lv: 2, cost: 100, val: 0.35, label: '第二重·+35%' },
        { lv: 3, cost: 220, val: 0.60, label: '第三重·+60%' },
      ] },
    { id: 'daYan', name: '大衍决', desc: '法力恢复', realm: '筑基', type: 'base', cl: '#6080ff',
      tiers: [
        { lv: 1, cost: 30, val: 0.3, label: '第一重·+30%' },
        { lv: 2, cost: 70, val: 0.7, label: '第二重·+70%' },
        { lv: 3, cost: 150, val: 1.2, label: '第三重·+120%' },
      ] },
    // ===== Boss特殊功法（击败对应Boss解锁） =====
    { id: 'moYiPoison', name: '墨医毒经', desc: '周身毒雾·持续伤敌', realm: '炼气', type: 'boss', bossIdx: 0, cl: '#80ff00',
      tiers: [{ lv: 1, cost: 100, val: 4, label: '修习·毒雾+4/秒' }],
      spell: '毒雾护体——周身3秒毒伤敌人', spellId: 'poisonAura' },
    { id: 'moJiaoBlood', name: '墨蛟血炼', desc: '生命恢复·伤害提升', realm: '筑基', type: 'boss', bossIdx: 1, cl: '#c04040',
      tiers: [{ lv: 1, cost: 150, val: 3, val2: 0.12, label: '修习·回血+3/s·伤+12%' }],
      spell: '蛟血沸腾——每秒恢复生命并增强伤害', spellId: 'bloodRage' },
    { id: 'jinJiaoScale', name: '金蛟逆鳞', desc: '防御强化·反伤', realm: '筑基', type: 'boss', bossIdx: 2, cl: '#d4af37',
      tiers: [{ lv: 1, cost: 150, val: 0.18, val2: 2, label: '修习·生命+18%·减伤+2' }],
      spell: '逆鳞护体——受击时反射伤害', spellId: 'scaleReflect' },
    { id: 'tianMingSword', name: '天明剑诀', desc: '飞剑极致强化', realm: '结丹', type: 'boss', bossIdx: 3, cl: '#40e0d0',
      tiers: [{ lv: 1, cost: 250, val: 0.35, val2: 0.4, label: '修习·飞剑+35%速度·伤害+40%' }],
      spell: '天明一闪——飞剑飞行速度与伤害大幅提升', spellId: 'swordSurge' },
    { id: 'yuanShaDemon', name: '元刹魔功', desc: '攻击吸血', realm: '结丹', type: 'boss', bossIdx: 4, cl: '#c020c0',
      tiers: [{ lv: 1, cost: 280, val: 0.15, val2: 0.08, label: '修习·伤害+15%·吸血8%' }],
      spell: '魔功噬血——攻击时吸取敌人生命', spellId: 'lifeSteal' },
    { id: 'huMoTrue', name: '呼魔真解', desc: '杀敌回蓝·神识增强', realm: '元婴', type: 'boss', bossIdx: 5, cl: '#6060c0',
      tiers: [{ lv: 1, cost: 300, val: 30, val2: 0.12, label: '修习·杀敌+30法力·伤+12%' }],
      spell: '魔魂吞噬——击杀敌人恢复法力并提升伤害', spellId: 'soulDevour' },
    { id: 'yuanShaSplit', name: '元刹分魂诀', desc: '分身灵体·全面强化', realm: '元婴', type: 'boss', bossIdx: 6, cl: '#ff40ff',
      tiers: [{ lv: 1, cost: 500, val: 6, val2: 0.2, label: '修习·回血+6/s·全属性+20%' }],
      spell: '分魂化影——召唤分魂协助战斗', spellId: 'splitSoul' },
];

// ===== 随机事件配置 =====
export const EVENTS = [
    // NPC遭遇
    { id: 'moOld', name: '偶遇墨老', type: 'npc',
      text: '山间小径上，你遇到一位白发老者，正是七玄门的墨老。他眯眼打量你:"小娃娃，你根骨不错，老夫这里有一粒培元丹，可助你修行..."',
      option1: '接受丹药', result1: { item: '培元丹', msg: '墨老大笑，递过丹药。' },
      option2: '婉言谢绝', result2: { mana: 30, msg: '墨老点头:"谨慎是好事。"说完拂袖而去，一阵灵气涌入你体内。' } },
    { id: 'nangong', name: '南宫问月', type: 'npc',
      text: '月下竹林，一道白影掠过。竟是掩月宗南宫婉。她回头看了你一眼，淡然道:"你我有些缘分...此物赠你。"',
      option1: '接受宝物', result1: { stones: 50, msg: '南宫婉手中多了一袋灵石，轻轻抛来。"日后可来掩月宗找我。"' },
      option2: '请教修行', result2: { exp: 60, msg: '南宫婉轻点你眉心，一道灵光闪过。"前路漫漫，保重。"' } },
    { id: 'wangLu', name: '王陆算命', type: 'npc',
      text: '集市角落，一个手持幡旗的游方道士叫住你:"道友且慢！贫道观你印堂发黑，近日必有大凶！不过只需100灵石，贫道可为你化解..."',
      option1: '付钱消灾', result1: { cost: 100, msg: '道士收钱后念了一通咒语，你感觉体内灵气似乎微微增长...', playerExp: 80 },
      option2: '转身离开', result2: { msg: '"诶！道友别走啊！50灵石也行！"你已走远。' } },
    { id: 'qiXuan', name: '七玄门遗宝', type: 'npc',
      text: '密林深处，你发现一座残破石碑，刻着"七玄门"三字。碑下压着一本泛黄古籍和一把锈剑。一位守碑老者道:"有缘人，只能取其一。"',
      option1: '取古籍', result1: { item: '凝元丹', msg: '古籍中记载着一枚丹药配方，正好凝结成丹。' },
      option2: '取锈剑', result2: { stones: 80, msg: '锈剑入手，竟是一柄灵器！你以灵力感应，品相尚可，可换不少灵石。' } },
    // 奇遇
    { id: 'spiritSpring', name: '灵泉沐浴', type: 'treasure',
      text: '山谷深处雾气氤氲，发现一处天然灵泉。泉水散发沁人心脾的灵气，你的疲惫一扫而空。',
      option1: '沐浴灵泉', result1: { healPct: 1, manaPct: 1, msg: '你在灵泉中打坐修行，灵力饱满，伤势尽愈！' },
      option2: '收集灵液', result2: { bottle: 0.3, msg: '你取出掌天瓶，小心翼翼地收集了些许灵液。' } },
    { id: 'herbField', name: '灵草园', type: 'treasure',
      text: '顺着灵气波动，你发现一处隐藏的灵草园！园中数种草药长势喜人，显然是前人精心培育。',
      option1: '采集黄龙草', result1: { item: '培元丹', msg: '你采下几株黄龙草，以灵力炼成一枚培元丹。' },
      option2: '采集血灵草', result2: { item: '血灵丹', msg: '你采下几株血灵草，炼成一枚血灵丹，药力澎湃。' } },
    { id: 'fallenStar', name: '坠星石', type: 'treasure',
      text: '夜空一道流星划过，落在不远处的山丘上。你赶去查看，发现一颗散发微光的陨石，蕴含天外灵力。',
      option1: '吸收星辰力', result1: { exp: 100, msg: '陨石中的星辰之力涌入你体内，修为大增！' },
      option2: '贩卖陨石', result2: { stones: 120, msg: '你将陨石带到坊市，被一位炼器师高价收购。' } },
    { id: 'ancientPavilion', name: '古修洞府', type: 'treasure',
      text: '峭壁上隐约可见一道石门，推开厚重的石壁，竟是一座古代修士的遗府！府中尚有禁制残留。',
      option1: '强行破除禁制', result1: { stones: 100, msg: '禁制虽难，但你以蛮力破之，府中灵石尽归你所有！' },
      option2: '参悟禁制奥秘', result2: { playerExp: 120, msg: '你盘膝参悟禁制符文，境界感悟大有精进！' } },
    // 天象
    { id: 'bloodMoon', name: '血月之夜', type: 'phenomenon',
      text: '天空中月亮染上血色，方圆百里的灵气变得狂暴。妖兽蠢蠢欲动，修士们纷纷闭关避祸。',
      option1: '趁乱猎妖', result1: { stones: 80, msg: '你猎杀数只被血月影响的妖兽，获得不少灵石。' },
      option2: '闭关修炼', result2: { healPct: 0.5, exp: 40, msg: '你寻一处山洞闭关，默默吸收血月中的狂暴灵力。' } },
    { id: 'spiritTide', name: '灵气潮汐', type: 'phenomenon',
      text: '天边灵气如潮水般涌来，百年难遇的灵气潮汐席卷修仙界！所有修士趁此机遇突破瓶颈。',
      option1: '全力突破', result1: { playerExp: 160, msg: '你竭尽全力运转功法，境界一飞冲天！' },
      option2: '布阵聚灵', result2: { bottle: 0.5, mana: 50, msg: '你以阵法引动潮汐灵气，掌天瓶中灵液暴涨，法力充盈！' } },
    // 险境
    { id: 'banditAmbush', name: '散修劫道', type: 'danger',
      text: '羊肠小道上，三名面目凶恶的散修拦住去路:"交出灵石，饶你不死！"',
      option1: '正面迎战', result1: { stones: 60, msg: '你拔剑应战，三招两式便将他们击退，反抢了他们的灵石！', risk: 0.3 },
      option2: '施展罗烟步遁走', result2: { msg: '你施展身法，如烟如雾，瞬间消失在众人眼前。散修面面相觑。"人呢？"' } },
    { id: 'caveBeast', name: '洞窟妖兽', type: 'danger',
      text: '你发现一个隐秘洞窟，洞中灵气浓郁但散发着危险气息。深处似乎沉睡着什么...',
      option1: '深入探宝', result1: { stones: 150, msg: '你冒险深入，避开沉睡的妖兽，找到了不少灵石储备！', risk: 0.4 },
      option2: '谨慎离开', result2: { msg: '"此地不宜久留..."你悄然退出，记下了洞窟的位置。' } },
];
