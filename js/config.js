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
    筑基: { duration: 12, boltSpd: 320, boltDmg: 14, boltGap: 0.22, boltsPer: 2, sideBolts: 1 },
    结丹: { duration: 16, boltSpd: 380, boltDmg: 24, boltGap: 0.16, boltsPer: 3, sideBolts: 2 },
    元婴: { duration: 20, boltSpd: 440, boltDmg: 35, boltGap: 0.12, boltsPer: 4, sideBolts: 2 },
    化神: { duration: 25, boltSpd: 520, boltDmg: 50, boltGap: 0.08, boltsPer: 5, sideBolts: 3 },
};

// ===== 进阶配置 =====
export const BREAKTHROUGH = {
    筑基: { items: ['筑基丹'], desc: '服用筑基丹冲击筑基', icon: '💊' },
    结丹: { tech: 'triRevolve', techName: '三转重元功', desc: '三转重元功圆满·凝结金丹', icon: '☯' },
    元婴: { items: ['补天丹', '九曲灵参丹', '养魂木'], desc: '三宝齐聚·碎丹成婴', icon: '✨' },
    化神: { items: ['元磁神山', '金蛟王内丹', '五色极寒之焰'], desc: '三大至宝·化神飞升', icon: '�' },
};

// ===== 技能配置 =====
export const SKILLS = [
    { id: 'fireball', name: '火球术', mana: 15, cd: 2, desc: '向鼠标方向射出火球', keys: ['Digit1'], cl: '#ff6030' },
    { id: 'flyingSwords', name: '飞剑术', mana: 40, cd: 8, desc: '周身飞剑齐射', keys: ['Digit2'], cl: '#40c060' },
    { id: 'shield', name: '金刚罩', mana: 30, cd: 10, desc: '3秒内无敌', keys: ['Digit3'], cl: '#ffd700' },
    { id: 'greatSword', name: '巨剑术', mana: 50, cd: 25, desc: '向鼠标方向射出巨型剑气', keys: ['Digit4'], cl: '#ff8040' },
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

// ===== 地图系统 =====
// WORLD_MAP: 一级→二级→三级 树形结构，叶子节点为可游玩关卡
// unlock: null=无条件, { realm, items, clear } 任一条件满足即可
const _stages = [];
function _s(node, parentId) {
    if (node.stage) {
        node.stage.id = node.id;
        node.stage.worldParent = parentId;
        _stages.push(node.stage);
    }
    if (node.children) for (const c of node.children) _s(c, node.id);
}
export const WORLD_MAP = [
    { id: 'tianNan', name: '天南大陆', desc: '天南·越国修仙界', cl: '#60c060', children: [
        { id: 'qiXuan', name: '七玄门', desc: '岚州小派·墨大夫藏身之处', cl: '#80a060', children: [
            { id: 'qxWaiMen', name: '外门', desc: '外门弟子修炼地', unlock: null, stage: { name: '七玄门·外门', env: '#1a2a10', env2: '#0a1a08', waves: 3, dropQX: true } },
            { id: 'qxMiDao', name: '密道', desc: '通往墨大夫密室', unlock: { clear: ['qxWaiMen'] }, chest: { stones: [30,60] }, stage: { name: '七玄门·密道', env: '#0a1a08', env2: '#050a03', waves: 4, dropQX: true } },
            { id: 'qxMiShi', name: '密室', desc: '墨大夫藏身之处', unlock: { realm: '炼气', realmStage: 3, clear: ['qxMiDao'] }, stage: { name: '七玄门·密室', env: '#0a0a08', env2: '#050508', waves: 5, boss: { name: '墨大夫（莫居仁）', hp: 80, atk: 8, size: 24, exp: 200, drops: ['墨大夫手札'],
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
              ] } } },
        ] },
        { id: 'huangFeng', name: '黄枫谷', desc: '越国修仙大派', cl: '#c0a040', unlock: { realm: '炼气', clear: ['qxMiShi'], items: ['墨大夫手札', '升仙令'] }, children: [
            { id: 'hfWaiWei', name: '外围山林', desc: '谷外妖兽出没', stage: { name: '黄枫谷·外围山林', env: '#1a1a0a', env2: '#0a0a05', waves: 5 } },
            { id: 'hfShiLian', name: '试炼之路', desc: '入谷试炼', unlock: { clear: ['hfWaiWei'] }, chest: { stones: [50,100] }, stage: { name: '黄枫谷·试炼之路', env: '#2a2a0a', env2: '#1a1a05', waves: 6 } },
            { id: 'hfxueSe', name: '血色禁地', desc: '墨蛟之窟', unlock: { clear: ['hfShiLian'] }, stage: { name: '黄枫谷·血色禁地', env: '#1a0a0a', env2: '#0a0505', waves: 7, boss: { name: '墨蛟', hp: 200, atk: 18, size: 30, exp: 500, drops: ['筑基丹'],
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
              ] } } },
        ] },
        { id: 'zhengMo', name: '正魔大战战场', desc: '正道魔道交锋之地', cl: '#c06040', unlock: { realm: '筑基', clear: ['hfxueSe'] }, children: [
            { id: 'zmQianYan', name: '前沿阵地', desc: '双方交战边缘', stage: { name: '战场·前沿阵地', env: '#1a1a0a', env2: '#0a0a05', waves: 6 } },
            { id: 'zmShiGu', name: '尸骨之地', desc: '古修士遗骸遍布', unlock: { clear: ['zmQianYan'] }, chest: { stones: [80,150] }, stage: { name: '战场·尸骨之地', env: '#0a0808', env2: '#050404', waves: 7 } },
            { id: 'zmHeXin', name: '核心地带', desc: '两军主帅交锋处', unlock: { clear: ['zmShiGu'] }, stage: { name: '战场·核心地带', env: '#1a0a0a', env2: '#0a0505', waves: 8, boss: { name: '鬼灵门少主·王婵', hp: 350, atk: 35, size: 26, exp: 800, drops: ['大挪移传送令'],
              pre: [
                { speaker: 'narr', text: '战场核心地带，尸横遍野。一个身穿黑袍的青年负手立于尸山之上，周身鬼气森森。' },
                { speaker: 'boss', text: '哦？居然还有人能走到这里来。正道？魔道？不过都是本少的垫脚石罢了。' },
                { speaker: 'boss', text: '我乃鬼灵门少主王婵。奉家父之命来此战场搜集生魂，修练万魂经。正魔大战？呵，本少不关心。' },
                { speaker: 'boss', text: '不过你的魂魄倒是颇为精纯...拿来炼成主魂再好不过！' }
              ],
              post: [
                { speaker: 'narr', text: '王婵的护体鬼气轰然破碎，他踉跄后退，脸上终于露出惊惧之色。' },
                { speaker: 'boss', text: '不...不可能！本少的万魂经已炼至第四层，怎会败给你？！' },
                { speaker: 'boss', text: '可恶...若非此战消耗太大...你给本少记住！鬼灵门不会放过你的！' },
                { speaker: 'narr', text: '王婵捏碎一枚传送符，身形消散。一枚大挪移传送令从他消失之处掉落——乱星海的通行凭证！' }
              ] } } },
        ] },
        { id: 'luoYun', name: '落云宗', desc: '天南第一剑宗', cl: '#60a0ff', unlock: { realm: '结丹', realmStage: 3, items: ['风雷翅'], clear: ['lxWaiHai'] }, children: [
            { id: 'lyShanMen', name: '山门', desc: '落云宗山脚', stage: { name: '落云宗·山门', env: '#0a1a2a', env2: '#050a1a', waves: 8 } },
            { id: 'lyGuXiu', name: '古修遗府', desc: '古修士洞府', unlock: { clear: ['lyShanMen'] }, stage: { name: '落云宗·古修遗府', env: '#0a0a1a', env2: '#05050a', waves: 9, boss: { name: '古修残魂', hp: 600, atk: 55, size: 26, exp: 1400 } } },
        ] },
    ] },
    { id: 'lx', name: '乱星海', desc: '海外修士·无法之地', cl: '#4080ff', unlock: { realm: '筑基', realmStage: 3, items: ['大挪移传送令'] }, children: [
        { id: 'lxQianHai', name: '浅海', desc: '乱星海入口', stage: { name: '乱星海·浅海', env: '#0a0a1a', env2: '#05050a', waves: 3 } },
        { id: 'lxJiYin', name: '极阴岛', desc: '极阴老祖巢穴', unlock: { realm: '结丹', clear: ['lxQianHai'] }, children: [
            { id: 'lxjyDaoAn', name: '岛岸', desc: '极阴岛外围', stage: { name: '极阴岛·岛岸', env: '#0a0a0a', env2: '#050505', waves: 7 } },
            { id: 'lxjyDongKu', name: '极阴洞窟', desc: '极阴老祖隐修处', unlock: { clear: ['lxjyDaoAn'] }, stage: { name: '极阴岛·洞窟', env: '#0a0a0a', env2: '#000000', waves: 9, escape: '虚天残图', boss: { name: '极阴老祖', hp: 500, atk: 45, size: 28, exp: 1200,
              pre: [
                { speaker: 'narr', text: '极阴岛深处，洞窟中黑雾弥漫。一道苍老阴森的身影悬浮在洞窟中央，正是极阴老祖。' },
                { speaker: 'boss', text: '桀桀桀...多少年了，竟有生人闯入本座洞府。小辈，你胆子不小嘛。' },
                { speaker: 'boss', text: '本座极阴老祖，纵横乱星海五百余年。你的修为虽浅，但这具肉身倒是不错...' },
                { speaker: 'boss', text: '既然来了，就别走了！留下来做本座的新躯壳吧！' }
              ],
              post: [
                { speaker: 'narr', text: '极阴老祖的鬼雾被打散，你趁机夺路而逃。身后传来极阴老祖愤怒的咆哮。' },
                { speaker: 'boss', text: '混账！！竟敢从本座手中逃脱！' },
                { speaker: 'narr', text: '你冲出洞窟时，一道残破的古老地图从壁缝落入手中——虚天残图！上面标记着虚天殿的位置。' }
              ] } } },
        ] },
        { id: 'lxXuTian', name: '虚天殿', desc: '上古修士遗府', cl: '#a0a0ff', unlock: { realm: '结丹', items: ['虚天残图'] }, children: [
            { id: 'lxxtWaiDian', name: '外殿', desc: '虚天殿外围', stage: { name: '虚天殿·外殿', env: '#1a0a1a', env2: '#0a050a', waves: 9 } },
            { id: 'lxxtNeiDian', name: '内殿', desc: '玄骨上人镇守', unlock: { clear: ['lxxtWaiDian'] }, stage: { name: '虚天殿·内殿', env: '#1a0a1a', env2: '#0a050a', waves: 10, boss: { name: '玄骨上人', hp: 800, atk: 70, size: 28, exp: 2000, drops: ['虚天鼎', '补天丹', '九曲灵参丹'],
              pre: [
                { speaker: 'narr', text: '虚天殿内殿，一股远古蛮荒的气息扑面而来。白骨宝座上，一道骷髅般的身影缓缓站起。' },
                { speaker: 'boss', text: '多少年了...终于有人能走到这里。本座玄骨上人，曾是上古体修第一人。' },
                { speaker: 'boss', text: '肉身已毁，但本座的元神与这虚天殿早已合为一体。任何闯入者，都将是本座的养料！' },
                { speaker: 'boss', text: '虚天鼎乃是本座毕生心血所炼。你想要？那就用命来换吧！' }
              ],
              post: [
                { speaker: 'narr', text: '玄骨上人的白骨身躯轰然碎裂，一道远古的禁制随之崩解。' },
                { speaker: 'boss', text: '这...这怎么可能...本座的元神与虚天殿相连...' },
                { speaker: 'narr', text: '虚天鼎从玄骨上人身上掉落，古铜色的鼎身散发微弱的光芒——这是通往极北之地的凭证。' }
              ] } } },
        ] },
        { id: 'lxWaiHai', name: '外星海', desc: '羽族栖息之地', cl: '#40a0a0', unlock: { realm: '结丹', clear: ['lxQianHai'] }, children: [
            { id: 'lxwhWaiWei', name: '外围', desc: '外星海浅海区域', stage: { name: '外星海·外围', env: '#0a1a2a', env2: '#050a1a', waves: 8 } },
            { id: 'lxwhShenHai', name: '深海裂隙', desc: '羽族大妖风希巢穴', unlock: { clear: ['lxwhWaiWei'] }, stage: { name: '外星海·深海裂隙', env: '#0a0a2a', env2: '#05051a', waves: 9, boss: { name: '羽族大妖·风希', hp: 700, atk: 60, size: 30, exp: 1800, drops: ['风雷翅'],
              pre: [
                { speaker: 'narr', text: '外星海深处，海水分向两侧，一道巨大的裂隙通向地底。裂口之上，银色双翼的身影缓缓降落。' },
                { speaker: 'boss', text: '人类修士...你身上有天南大陆的气息。能从那么远的地方来到这里，不容易。' },
                { speaker: 'boss', text: '本座风希，羽族之王。风雷翅乃是吾族千年传承之宝，吾便是为守护它而在此。' },
                { speaker: 'boss', text: '想要风雷翅？可以，只要你能接下本座的雷霆一击！' }
              ],
              post: [
                { speaker: 'narr', text: '风希的银色羽翼光芒黯淡，他跌落在地，神色复杂地看着你。' },
                { speaker: 'boss', text: '好...好小子。这风雷翅，是你的了。但记住——没有结丹后期的修为，强行使用会爆体而亡。' },
                { speaker: 'narr', text: '风雷翅缓缓飘入你的手中，一对银白色的羽翼，蕴含着狂暴的风雷之力。' }
              ] } } },
            { id: 'lxwhShenChu', name: '深处', desc: '金蛟王巢穴', unlock: { realm: '元婴', clear: ['lxwhShenHai'] }, stage: { name: '外星海·深处', env: '#0a0a1a', env2: '#050510', waves: 13, boss: { name: '金蛟王', hp: 3000, atk: 190, size: 36, exp: 7000, drops: ['金蛟王内丹'],
              pre: [
                { speaker: 'narr', text: '外星海最深处，海水漆黑如墨。一道硕大无比的金色蛟影自深渊中缓缓升起，双瞳如两轮金日。' },
                { speaker: 'boss', text: '人类...汝竟敢闯入吾之领地。千年来，你是第一个活着抵达此处之人。' },
                { speaker: 'boss', text: '吾乃金蛟王，龙族旁支。这颗内丹随吾修炼千年，已凝天地之造化。' },
                { speaker: 'boss', text: '既来了，就让吾看看汝是否有本事取走它！' }
              ],
              post: [
                { speaker: 'narr', text: '金蛟王庞大的身躯轰然坠海，溅起万丈巨浪。一颗金光璀璨的内丹自蛟口中吐出。' },
                { speaker: 'boss', text: '这颗内丹...随吾千年...今日便赠予汝吧...记住本座之名！' },
                { speaker: 'narr', text: '金蛟王内丹落入你手——其中蕴含着浩瀚的龙族灵气，炽热无比。' }
              ] } } },
        ] },
        { id: 'lxTianXing', name: '天星城', desc: '乱星海核心', cl: '#ffd700', unlock: { realm: '元婴', clear: ['lxxtNeiDian'] }, children: [
            { id: 'lxtxFangShi', name: '坊市', desc: '天星城交易中心', stage: { name: '天星城·坊市', env: '#1a1a0a', env2: '#0a0a05', waves: 0 } },
            { id: 'lxtxMiKu', name: '密库', desc: '城中秘宝', unlock: { clear: ['lxtxFangShi'] }, chest: { items: ['培元丹', '培元丹', '凝元丹'] }, stage: { name: '天星城·密库', env: '#2a2a0a', env2: '#1a1a05', waves: 0 } },
            { id: 'lxtxXingGong', name: '星宫', desc: '星宫双圣镇守', cl: '#c0a0ff', unlock: { realm: '元婴', clear: ['lxtxMiKu'] }, children: [
                { id: 'lxtxDingBu', name: '顶部', desc: '天星双圣', unlock: { clear: ['lxtxMiKu'] }, stage: { name: '星宫·顶部', env: '#0a0a2a', env2: '#05051a', waves: 12, boss: { name: '天星双圣', hp: 2500, atk: 180, size: 32, exp: 6000, drops: ['元磁神山'],
                  pre: [
                    { speaker: 'narr', text: '星宫殿顶，星光如瀑。天星双圣并肩立于穹顶之下，周身星芒流转，宛若日月同辉。' },
                    { speaker: 'boss', text: '乱星海多少年未曾有人能踏足此地。你既能到此处，想必已非凡俗之辈。' },
                    { speaker: 'boss', text: '吾二人镇守星宫千年，只为守护这元磁神山——星海之源。想要？先胜过本座再说！' }
                  ],
                  post: [
                    { speaker: 'narr', text: '天星双圣的星芒法阵崩解，二人嘴角溢血，相视一笑，退至一旁。' },
                    { speaker: 'boss', text: '好...后生可畏。元磁神山归你了——不过化神之路，远比你想象的更加凶险。' },
                    { speaker: 'narr', text: '元磁神山缓缓落入你手中——如同一座微缩的山岳，蕴含着不可思议的磁力。' }
                  ] } } },
            ] },
        ] },
    ] },
    { id: 'muLan', name: '幕兰/天澜草原', desc: '草原部落·天澜圣女', cl: '#c0c040', unlock: { realm: '元婴', clear: ['lyGuXiu'] }, children: [
        { id: 'mlZhanChang', name: '幕兰大战战场', desc: '草原第一战场', stage: { name: '幕兰战场', env: '#2a2a0a', env2: '#1a1a05', waves: 10, boss: { name: '幕兰大法师', hp: 1200, atk: 90, size: 30, exp: 3000 } } },
        { id: 'tlShengDi', name: '天澜圣地', desc: '天澜圣女居所', unlock: { realm: '元婴', clear: ['mlZhanChang'] }, stage: { name: '天澜圣地', env: '#0a1a0a', env2: '#050a05', waves: 12, boss: { name: '天澜圣女', hp: 1600, atk: 110, size: 28, exp: 4000 } } },
    ] },
    { id: 'daJin', name: '大晋', desc: '魔道宗门·昆吾之巅', cl: '#a040a0', unlock: { realm: '元婴', clear: ['tlShengDi'] }, children: [
        { id: 'djYinLuo', name: '阴罗宗', desc: '大晋第一魔宗', children: [
            { id: 'djylWaiZong', name: '外宗', desc: '阴罗宗外围', stage: { name: '阴罗宗·外宗', env: '#1a0a1a', env2: '#0a050a', waves: 10 } },
            { id: 'djylDiLao', name: '地牢', desc: '阴罗宗囚牢', unlock: { clear: ['djylWaiZong'] }, chest: { stones: [150,300] }, stage: { name: '阴罗宗·地牢', env: '#0a0a0a', env2: '#050505', waves: 11 } },
            { id: 'djylDaDian', name: '大殿', desc: '阴罗宗宗主坐镇', unlock: { clear: ['djylDiLao'] }, stage: { name: '阴罗宗·大殿', env: '#0a0a0a', env2: '#000000', waves: 14, boss: { name: '阴罗宗宗主', hp: 2000, atk: 150, size: 32, exp: 5000, drops: ['昆吾玉卷'] } } },
        ] },
        { id: 'djKunWu', name: '昆吾山', desc: '镇魔塔·元刹分魂', cl: '#ff40ff', unlock: { realm: '元婴', items: ['昆吾玉卷'] }, children: [
            { id: 'djkwShanJiao', name: '山脚', desc: '昆吾山入口', stage: { name: '昆吾山·山脚', env: '#0a0a0a', env2: '#050505', waves: 14 } },
            { id: 'djkwZhenMo', name: '镇魔塔', desc: '元刹圣祖分魂', unlock: { clear: ['djkwShanJiao'] }, stage: { name: '昆吾山·镇魔塔', env: '#0a0a0a', env2: '#000000', waves: 16, boss: { name: '元刹圣祖分魂', hp: 3000, atk: 200, size: 36, exp: 10000,
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
              ] } } },
        ] },
    ] },
    { id: 'jiBei', name: '极北之地', desc: '冰凤镇守·小极宫', cl: '#80c0ff', unlock: { realm: '元婴', items: ['虚天鼎'] }, children: [
        { id: 'jbBingYuan', name: '极北冰原', desc: '极北入口·冰原', stage: { name: '极北冰原', env: '#1a2a2a', env2: '#0a1a1a', waves: 6 } },
        { id: 'jbXiaoJi', name: '小极宫', desc: '冰凤栖息之处', unlock: { realm: '元婴', clear: ['jbBingYuan'] }, children: [
            { id: 'jbxjQianDian', name: '前殿', desc: '小极宫外围', stage: { name: '小极宫·前殿', env: '#0a1a2a', env2: '#050a1a', waves: 7 } },
            { id: 'jbxjXuanTian', name: '玄天殿', desc: '冰凤镇守', unlock: { clear: ['jbxjQianDian'] }, stage: { name: '小极宫·玄天殿', env: '#0a1a2a', env2: '#050a1a', waves: 10, boss: { name: '冰凤', hp: 2000, atk: 160, size: 34, exp: 5000,
              pre: [
                { speaker: 'narr', text: '玄天殿中寒气刺骨。大殿正中，一只通体冰蓝的巨大凤凰缓缓展开双翼，冰晶般的光芒照亮了整个殿堂。' },
                { speaker: 'boss', text: '人类...能在极北走到这里，你是第一个。吾乃冰凤，极北之主。' },
                { speaker: 'boss', text: '虚天鼎...你身上有虚天鼎的气息。那是上古之物，与吾有千丝万缕的渊源。' },
                { speaker: 'boss', text: '让吾看看，你是否有资格持有虚天鼎！' }
              ],
              post: [
                { speaker: 'narr', text: '冰凤发出一声清越的长鸣，冰蓝羽翼收拢。它缓缓落到你面前。' },
                { speaker: 'boss', text: '好...你确实有资格。虚天鼎在你手中，或许比在极北更有用。' },
                { speaker: 'narr', text: '冰凤将一道极寒灵力注入虚天鼎，古鼎泛起冰蓝色的微光——似乎在记载了什么重要的信息。' }
              ] } } },
            { id: 'jbxjGongDian', name: '宫殿内', desc: '寒骊上人镇守·极寒灵焰', unlock: { realm: '元婴', clear: ['jbxjXuanTian'] }, stage: { name: '小极宫·宫殿内', env: '#0a0a1a', env2: '#050510', waves: 12, boss: { name: '寒骊上人', hp: 2800, atk: 175, size: 30, exp: 6500, drops: ['五色极寒之焰'],
              pre: [
                { speaker: 'narr', text: '小极宫最深处，万载寒冰覆盖大殿。一道白衣身影盘坐于冰晶莲台之上，周身五色寒焰吞吐不定。' },
                { speaker: 'boss', text: '后辈，你能走到这里，说明冰凤已认可你。但本座与它不同——吾寒骊上人，只信手中之焰。' },
                { speaker: 'boss', text: '五色极寒之焰，极北深渊万年寒气所化。本座以此焰修行至今，尚未遇敌手。' },
                { speaker: 'boss', text: '你若能胜过本座，此焰归你。若败——便永远留在此地陪伴吾吧！' }
              ],
              post: [
                { speaker: 'narr', text: '寒骊上人的五色寒焰缓缓散去，他苦笑着望向手中熄灭的火焰。' },
                { speaker: 'boss', text: '万年来...终于有人能熄灭这五色极寒之焰。拿去吧，这是你应得的。' },
                { speaker: 'narr', text: '五色极寒之焰化作一道五色流光飞入你掌心——极寒与极热交织，神秘莫测。' }
              ] } } },
        ] },
    ] },
];
_s({ children: WORLD_MAP }, '');
export const STAGES = _stages;

// ===== 关键道具 =====
export const KEY_ITEMS = {
    '墨大夫手札': { desc: '墨大夫毕生毒术与医术心得', icon: '📜' },
    '升仙令': { desc: '七玄门信物·可前往黄枫谷', icon: '🪪' },
    '大挪移传送令': { desc: '乱星海传送凭证', icon: '🔮' },
    '风雷翅': { desc: '羽族千年传承之宝·风雷之力', icon: '🪽' },
    '虚天残图': { desc: '标记虚天殿位置的古老残图', icon: '🗺' },
    '虚天鼎': { desc: '上古玄骨上人毕生心血·通往极北之凭证', icon: '🏺' },
    '昆吾玉卷': { desc: '昆吾山古道传承玉卷', icon: '📿' },
    '筑基丹': { desc: '突破炼气瓶颈·冲击筑基', icon: '💊' },
    '补天丹': { desc: '玄骨上人秘藏·修补灵根', icon: '🥇' },
    '九曲灵参丹': { desc: '魂力凝丹·滋养元神', icon: '🟣' },
    '养魂木': { desc: '上古神木·温养魂魄', icon: '🪵' },
    '元磁神山': { desc: '天星双圣所镇·元磁至宝', icon: '⛰' },
    '金蛟王内丹': { desc: '金蛟王千年修为结晶', icon: '🔶' },
    '五色极寒之焰': { desc: '极北深渊·天地灵焰', icon: '🔥' },
};

const _bossTechTemp = [
    { id: 'moYiPoison', bossStage: 'qxMiShi', name: '墨医毒经', desc: '周身毒雾·持续伤敌', realm: '炼气', cl: '#80ff00', tiers: [{ lv:1,cost:100,val:4,label:'修习·毒雾+4/秒'}], spell: '毒雾护体——周身3秒毒伤敌人', spellId: 'poisonAura' },
    { id: 'moJiaoBlood', bossStage: 'hfxueSe', name: '墨蛟血炼', desc: '生命恢复·伤害提升', realm: '筑基', cl: '#c04040', tiers: [{ lv:1,cost:150,val:3,val2:0.12,label:'修习·回血+3/s·伤+12%'}], spell: '蛟血沸腾——每秒恢复生命并增强伤害', spellId: 'bloodRage' },
    { id: 'wangChanSoul', bossStage: 'zmHeXin', name: '万魂经残篇', desc: '杀敌回蓝·神识增强', realm: '筑基', cl: '#6060c0', tiers: [{ lv:1,cost:180,val:30,val2:0.12,label:'修习·杀敌+30法力·伤+12%'}], spell: '魂力吞噬——击杀敌人恢复法力并提升伤害', spellId: 'soulDevour' },
    { id: 'fengXiWing', bossStage: 'lxwhShenHai', name: '风雷翅功法', desc: '移速与伤害大增', realm: '结丹', cl: '#40e0d0', tiers: [{ lv:1,cost:250,val:0.25,val2:0.35,label:'修习·移速+25%·伤+35%'}], spell: '风雷之力——移动速度与伤害大幅提升', spellId: 'windThunder' },
    { id: 'xuanGuBody', bossStage: 'lxxtNeiDian', name: '玄骨锻体诀', desc: '防御强化·生命大增', realm: '结丹', cl: '#d4af37', tiers: [{ lv:1,cost:250,val:0.3,val2:3,label:'修习·生命+30%·减伤+3'}], spell: '骨体强化——受击时减免伤害并反伤', spellId: 'boneArmor' },
    { id: 'muLanMagic', bossStage: 'mlZhanChang', name: '幕兰咒法', desc: '攻击吸血', realm: '元婴', cl: '#c020c0', tiers: [{ lv:1,cost:300,val:0.15,val2:0.08,label:'修习·伤害+15%·吸血8%'}], spell: '咒法噬血——攻击时吸取敌人生命', spellId: 'lifeSteal' },
    { id: 'tianLanGrace', bossStage: 'tlShengDi', name: '天澜圣典', desc: '全面强化', realm: '元婴', cl: '#ff40ff', tiers: [{ lv:1,cost:400,val:6,val2:0.2,label:'修习·回血+6/s·全属性+20%'}], spell: '圣典祝福——生命、攻击、法力全面增强', spellId: 'splitSoul' },
    { id: 'yinLuoDemon', bossStage: 'djylDaDian', name: '阴罗魔典', desc: '伤害强化·法回大增', realm: '元婴', cl: '#a040a0', tiers: [{ lv:1,cost:400,val:0.25,val2:0.8,label:'修习·伤+25%·法回+80%'}], spell: '魔典真言——攻击力与法力恢复大幅提升', spellId: 'demonTome' },
    { id: 'icePhoenix', bossStage: 'jbxjXuanTian', name: '冰凤真血', desc: '极寒护体·生命大增', realm: '元婴', cl: '#80c0ff', tiers: [{ lv:1,cost:500,val:0.4,val2:5,label:'修习·生命+40%·减伤+5'}], spell: '冰凤护体——大幅减免伤害并提升生命', spellId: 'iceGuard' },
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
    筑基丹: { desc: '突破炼气瓶颈·冲击筑基', fx: 'none', cl: '#80ff80' },
    补天丹: { desc: '玄骨上人秘藏·修补灵根', fx: 'none', cl: '#d4af37' },
    九曲灵参丹: { desc: '魂力凝丹·滋养元神', fx: 'none', cl: '#c080ff' },
    养魂木: { desc: '上古神木·温养魂魄', fx: 'none', cl: '#8bc34a' },
    元磁神山: { desc: '天星双圣所镇·元磁至宝', fx: 'none', cl: '#ffd700' },
    金蛟王内丹: { desc: '金蛟王千年修为结晶', fx: 'none', cl: '#ffa040' },
    五色极寒之焰: { desc: '极北深渊·天地灵焰', fx: 'none', cl: '#80d0ff' },
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
    { id: 'triRevolve', name: '三转重元功', desc: '自动回血·结丹必备', realm: '筑基', type: 'base', cl: '#ffa040',
      tiers: [
        { lv: 1, cost: 40, val: 1, label: '第一重·回血+1/s' },
        { lv: 2, cost: 100, val: 2, label: '第二重·回血+2/s' },
        { lv: 3, cost: 220, val: 3.5, label: '第三重·回血+3.5/s' },
      ] },
    // ===== Boss特殊功法（击败对应Boss解锁） =====
    ..._bossTechTemp.map(bt => ({ ...bt, type: 'boss', bossStage: bt.bossStage })),
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

// ===== 战利品掉落表 =====
export const LOOT_TABLES = {
    普通: [
        { item: 'stones', min: 1, max: 5, chance: 0.4 },
        { item: '培元丹', min: 1, max: 1, chance: 0.08 },
        { item: '回灵丹', min: 1, max: 1, chance: 0.05 },
    ],
    弓手: [
        { item: 'stones', min: 1, max: 6, chance: 0.45 },
        { item: '血灵丹', min: 1, max: 1, chance: 0.1 },
        { item: '金雷竹材', min: 1, max: 1, chance: 0.06 },
    ],
    冲锋: [
        { item: 'stones', min: 2, max: 8, chance: 0.5 },
        { item: '培元丹', min: 1, max: 1, chance: 0.12 },
        { item: '凝元丹', min: 1, max: 1, chance: 0.08 },
    ],
    召唤师: [
        { item: 'stones', min: 1, max: 10, chance: 0.5 },
        { item: '回灵丹', min: 1, max: 1, chance: 0.15 },
        { item: '毒丹', min: 1, max: 1, chance: 0.1 },
    ],
    精英: [
        { item: 'stones', min: 3, max: 12, chance: 0.6 },
        { item: '培元丹', min: 1, max: 2, chance: 0.2 },
        { item: '凝元丹', min: 1, max: 1, chance: 0.15 },
        { item: '金雷竹材', min: 1, max: 1, chance: 0.1 },
    ],
    boss: [
        { item: 'stones', min: 0, max: 0, chance: 0 },
    ],
};

export const HERB_BONUS = [
    { item: 'stones', min: 2, max: 8, chance: 0.25 },
    { item: '培元丹', min: 1, max: 1, chance: 0.1 },
    { item: '金雷竹材', min: 1, max: 1, chance: 0.05 },
];
