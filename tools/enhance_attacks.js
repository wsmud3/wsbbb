// Enhance bare attack_action descriptions
const fs = require('fs');
const path = require('path');

const FILES = {
    'blade/kuangfengdaofa.js': [
        '$N刀法展开，快如狂风，一刀接一刀砍向$n的$l',
        '$N大喝一声，手中刀光如匹练般卷向$n',
        '$N刀锋凌厉，带着刺耳的破空声，劈向$n要害',
        '$N身形急转，刀光如雪花般纷飞，笼罩$n全身',
    ],
    'blade/kuangfengkuaidao.js': [
        '$N快刀如电，瞬息之间已向$n连砍数刀',
        '$N手中刀光一闪，快得令人眼花，斩向$n的$l',
        '$N刀法展开，招招抢攻，逼得$n连连后退',
    ],
    'blade/xuedao.js': [
        '$N血刀一挥，刀光中带着一股血腥之气，劈向$n',
        '$N狞笑一声，手中血刀化作一道赤芒，砍向$n的$l',
        '$N刀法诡异狠辣，血刀带着刺鼻的腥风，直取$n',
    ],
    'staff/lingshezhangfa.js': [
        '$N杖出如灵蛇，杖尖颤动不定，点向$n的$l',
        '$N手中杖棒化作一道青影，如灵蛇出洞般刺向$n',
        '$N杖法诡奇，杖影重重，令$n难以捉摸',
    ],
    'sword/duanjiajian.js': [
        '$N剑走中正，段家剑法正气凛然，直刺$n的$l',
        '$N剑尖轻颤，一招「大江东去」，剑气如虹贯向$n',
        '$N手中长剑如游龙般刺出，$n只觉剑气扑面而来',
    ],
    'sword/hengshanjianfa.js': [
        '$N恒山剑法展开，绵密严谨，剑气笼罩$n全身',
        '$N剑光霍霍，一招快似一招，正是恒山派的绵里藏针',
        '$N手中长剑挥洒自如，剑招如行云流水般刺向$n',
    ],
    'sword/hengshanwushenjian.js': [
        '$N五神剑出手，剑气纵横，五招连环攻向$n',
        '$N长啸一声，衡山五神剑的剑意如潮水般涌向$n',
        '$N剑势如虹，五道剑光同时迸发，直取$n要害',
    ],
    'sword/jinshejianfa.js': [
        '$N金蛇剑法诡异莫测，剑尖如金蛇吐信，刺向$n的$l',
        '$N手中长剑曲曲折折，如金蛇蜿蜒，攻向$n意想不到之处',
        '$N剑走偏锋，金蛇剑法的怪招令$n防不胜防',
    ],
    'sword/pixiejianfa.js': [
        '$N剑法快如鬼魅，一道寒光闪过，已然刺到$n身前',
        '$N身法诡异，剑招更是快得不可思议，$n只觉眼前一花',
        '$N辟邪剑法展开，剑光如电，招招不离$n要害',
    ],
    'sword/qinzhongjian.js': [
        '$N剑尖轻颤，发出阵阵琴音，扰乱$n心神的同时一剑刺出',
        '$N琴中藏剑，剑发琴音，$n被琴声所惑，难以防备',
    ],
    'sword/quanzhenjianfa.js': [
        '$N全真剑法堂堂正正，一剑刺出，浩然正气扑面而来',
        '$N剑招沉稳，每一剑都蕴含道家真意，直取$n的$l',
    ],
    'sword/songfengjianfa.js': [
        '$N剑啸如松涛，松风剑法学自青城，剑法连绵不绝',
        '$N松风剑法展开，剑光闪烁，如松间清风，无处不在',
    ],
    'sword/songshanjianfa.js': [
        '$N嵩山剑法气势雄浑，一剑既出，如山岳压顶',
        '$N剑招大开大阖，嵩山派的威猛尽在其中，直劈$n',
    ],
    'sword/yifengjianfa.js': [
        '$N移风剑法飘逸灵动，剑未至，剑气已迫人而来',
        '$N剑光流转，如清风拂面，实则暗藏杀机，刺向$n的$l',
    ],
    'throwing/feixingshu.js': [
        '$N手指轻弹，数道寒星破空而出，直取$n',
        '$N手腕一翻，暗器如流星般射向$n的$l',
    ],
    'throwing/mantianxing.js': [
        '$N双手齐扬，漫天暗器如雨点般射向$n',
        '$N冷笑一声，一片寒芒脱手而出，笼罩$n全身',
    ],
    'unarmed/canhezhangfa.js': [
        '$N双掌一错，参合掌法使出，掌力如排山倒海般涌向$n',
        '$N掌势忽快忽慢，参合庄的独门掌法让人难以招架',
    ],
    'unarmed/canhezhi.js': [
        '$N食指轻弹，参合指的指力破空而至，点向$n的$l',
        '$N手指连弹，数道指风嗤嗤作响，$n只觉穴道一麻',
    ],
    'unarmed/cuixinzhang2.js': [
        '$N双掌运劲，摧心掌力暗暗涌出，直透$n脏腑',
        '$N掌风阴柔，看似轻描淡写，实则摧心裂肺',
    ],
    'unarmed/dasongyangshenzhang.js': [
        '$N大嵩阳神掌施展开来，掌风炙热如烈火，拍向$n',
        '$N双掌赤红，嵩阳掌的热浪扑面而来，$n不由后退',
    ],
    'unarmed/douzhuanxingyi.js': [
        '$N斗转星移施展开来，移花接木，借力打力',
        '$N身形一转，斗转星移之间，$n的攻击被巧妙地反拨回去',
    ],
    'unarmed/huolongquan.js': [
        '$N火龙拳施展开来，拳风带着一股灼热之气，打向$n',
        '$N拳如流星，招招连环，火龙拳的威势令$n不敢怠慢',
    ],
    'unarmed/jueqingzhang.js': [
        '$N绝情掌法冷酷无情，掌风如刀，劈向$n的$l',
        '$N面无表情，绝情掌力破空而至，令人心寒',
    ],
    'unarmed/kongmingquan.js': [
        '$N空明拳看似轻描淡写，实则暗含大道至理，拳意绵绵',
        '$N拳法空灵，虚虚实实，$n只觉眼前拳影重重',
    ],
    'unarmed/luoyingshenjian.js': [
        '$N落英神剑掌施展开来，掌影如落花般缤纷洒落',
        '$N掌法飘逸，如秋风扫落叶，连绵不绝地攻向$n',
    ],
    'unarmed/sanyinwugongzhao.js': [
        '$N三阴蜈蚣爪带着一股阴毒之气，抓向$n的$l',
        '$N手指弯曲如钩，指甲泛着诡异的绿光，直取$n要害',
    ],
    'unarmed/shenghuolingfa.js': [
        '$N手持圣火令，招式奇诡，令$n眼花缭乱',
        '$N圣火令法非中土武功，招招出人意料，打向$n',
    ],
    'unarmed/songshanquanfa.js': [
        '$N嵩山拳法刚猛有力，一拳打出，虎虎生风',
        '$N拳势如嵩山般厚重，每一拳都力贯千钧',
    ],
    'unarmed/taishanquanfa.js': [
        '$N泰山拳法沉稳如山，拳力雄浑，直击$n',
        '$N一拳既出，如泰山压顶，气势磅礴',
    ],
    'unarmed/tanzhitong.js': [
        '$N拇指轻扣，中指弹出，「嗤」的一声，指力破空而至',
        '$N弹指神通精妙绝伦，一道指风直射$n的$l',
    ],
    'unarmed/yingzhaogong.js': [
        '$N五指如钩，鹰爪功使来狠辣凌厉，抓向$n要害',
        '$N双手成爪，出手如电，鹰爪的劲风令人生畏',
    ],
    'whip/wudugoufa.js': [
        '$N钩法诡异莫测，五毒钩带着一股腥风，钩向$n',
        '$N手中毒钩连挥，招招不离$n要害，狠辣无比',
    ],
    'whip/yinsuojinling.js': [
        '$N银索抖动，金铃叮当作响，扰乱$n心神的同时一鞭抽出',
        '$N银索如灵蛇般缠向$n，金铃之声夺人心魄',
    ],
};

const SKILL_DIR = path.join(__dirname, '..', 'world', 'skill');
let count = 0;

for (const [file, actions] of Object.entries(FILES)) {
    const fp = path.join(SKILL_DIR, file);
    if (!fs.existsSync(fp)) { console.log('  MISS: ' + file); continue; }
    let content = fs.readFileSync(fp, 'utf-8');

    // Replace existing attack_actions array
    const actionsStr = '\tthis.attack_actions = [\n\t\t"' + actions.join('",\n\t\t"') + '"\n\t];';
    const newContent = content.replace(
        /this\.attack_actions\s*=\s*\[[\s\S]*?\];/,
        actionsStr
    );

    if (newContent !== content) {
        fs.writeFileSync(fp, newContent, 'utf-8');
        console.log('  ✓ ' + file);
        count++;
    }
}

console.log('\nEnhanced ' + count + ' skills.');
