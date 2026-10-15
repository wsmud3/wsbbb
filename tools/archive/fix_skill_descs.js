// 为所有技能补全战斗描述
const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.join(__dirname, '..', 'world', 'skill');

// 闪躲描述模板
const DODGE_ACTIONS = {
    default: [
        '$n身形一晃，$N的攻击已然落空。',
        '$n足尖轻点，向后跃开，$N这一招扑了个空。',
        '$n一个「旱地拔葱」，身体向上笔直地纵起丈余，躲过了$N这一招。',
        '$n往后一纵，$N的攻击差之毫厘。',
        '$n身子一侧，$N的攻击擦身而过。',
        '$n陡然变招，$N的攻击被轻松化解。',
    ],
    qinggong: [
        '$n身形飘忽，宛如轻烟，$N的攻击落空了。',
        '$n足不点地，一招「青云直上」，$N的攻击差之毫厘。',
        '$n身法如电，$N只觉眼前一花，$n已在数丈之外。',
    ],
    guiyi: [
        '$n的身法诡异至极，$N眼前一花，$n的身影已经消失。',
        '$n身形一晃，$N只看到一道残影，攻击已然落空。',
        '$n身形如鬼魅般飘忽不定，$N的攻击尽数落空。',
    ],
};

// 招架描述模板
const PARRY_ACTIONS = [
    '$n横剑当胸，$N的攻势被尽数挡下。',
    '$n不慌不忙，手中兵器一转，化解了$N的攻势。',
    '$n手腕一翻，兵刃画出一道弧线，$N的攻击被格挡在外。',
    '$n看准来势，一招「如封似闭」，将$N的攻击拒之门外。',
];

// 攻击描述模板 — 按类型分类
const ATTACK_ACTIONS = {
    sword: [
        '$N手中长剑一抖，剑光如练，直刺$n的$l',
        '$N剑尖颤动，一招快似一招，袭向$n',
        '$N手腕轻转，剑锋划出一道凌厉的弧线，削向$n的$l',
        '$N剑走轻灵，剑光闪动间已至$n身前',
    ],
    blade: [
        '$N刀光如雪，力劈华山，砍向$n的$l',
        '$N刀锋一转，拦腰斩向$n',
        '$N手中刀光大盛，一刀快似一刀，逼向$n',
        '$N刀法凌厉，刀锋破空而至，劈向$n的$l',
    ],
    staff: [
        '$N杖影重重，一招「横扫千军」，打向$n的$l',
        '$N手中杖棒一转，力贯千钧，扫向$n',
        '$N杖法精奇，杖尖点向$n要害',
    ],
    club: [
        '$N棍影翻飞，劈头盖脸打向$n',
        '$N手中棍棒横扫，势大力沉，砸向$n的$l',
    ],
    unarmed: [
        '$N双掌一错，掌风凌厉，拍向$n的$l',
        '$N变掌为拳，一招「黑虎偷心」，直取$n胸前',
        '$N指风破空，嗤嗤有声，点向$n的$l',
        '$N拳风呼啸，一拳重过一拳，打向$n',
        '$N掌影飘飘，看似轻柔实则暗藏杀机，印向$n',
    ],
    whip: [
        '$N长鞭一抖，如灵蛇出洞，缠向$n的$l',
        '$N鞭影重重，鞭梢带着尖锐的破空声，抽向$n',
    ],
    throwing: [
        '$N手腕一翻，暗器破空而出，射向$n',
        '$N指尖轻弹，数点寒星直取$n要害',
    ],
};

// 按目录判断类型
function getSkillType(relPath) {
    if (relPath.startsWith('sword/')) return 'sword';
    if (relPath.startsWith('blade/')) return 'blade';
    if (relPath.startsWith('staff/')) return 'staff';
    if (relPath.startsWith('club/')) return 'club';
    if (relPath.startsWith('unarmed/')) return 'unarmed';
    if (relPath.startsWith('cuff/')) return 'unarmed';
    if (relPath.startsWith('finger/')) return 'unarmed';
    if (relPath.startsWith('hand/')) return 'unarmed';
    if (relPath.startsWith('strike/')) return 'unarmed';
    if (relPath.startsWith('claw/')) return 'unarmed';
    if (relPath.startsWith('whip/')) return 'whip';
    if (relPath.startsWith('throwing/')) return 'throwing';
    if (relPath.startsWith('dodge/')) return 'dodge';
    if (relPath.startsWith('parry/')) return 'parry';
    return 'other';
}

function walk(dir, basePath) {
    for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) { walk(fp, basePath); continue; }
        if (!f.endsWith('.js')) continue;
        const content = fs.readFileSync(fp, 'utf-8');
        const rel = path.relative(basePath, fp).replace(/\\/g, '/');
        const type = getSkillType(rel);

        let modified = false;
        let newContent = content;

        // 为武器/拳脚技能添加attack_actions
        if (['sword','blade','staff','club','unarmed','whip','throwing'].includes(type)) {
            if (!content.includes('attack_actions')) {
                const actions = ATTACK_ACTIONS[type] || ATTACK_ACTIONS.unarmed;
                const actionsStr = '\tthis.attack_actions = [\n\t\t"' + actions.join('",\n\t\t"') + '"\n\t];\n';
                // 在 can_enables 之后或 grade 之后插入
                if (content.includes('this.can_enables')) {
                    newContent = content.replace(/(this\.can_enables\s*=\s*\[[^\]]*\];)/, '$1\n' + actionsStr);
                } else if (content.includes('this.grade')) {
                    newContent = content.replace(/(this\.grade\s*=\s*\d+;)/, '$1\n' + actionsStr);
                } else {
                    // Insert after desc
                    newContent = content.replace(/(this\.desc\s*=\s*"[^"]*";)/, '$1\n' + actionsStr);
                }
                if (newContent !== content) modified = true;
            }
        }

        // 为轻功添加dodge描述
        if (type === 'dodge') {
            if (!content.includes('query_dodge_action') && !content.includes('dodge_actions')) {
                const name = (content.match(/this\.name\s*=\s*"([^"]+)"/) || ['',''])[1];
                let actions = DODGE_ACTIONS.default;
                // 根据名字选择不同风格的闪躲描述
                if (name.includes('鬼') || name.includes('魔') || name.includes('幻') || name.includes('影')) {
                    actions = DODGE_ACTIONS.guiyi;
                }
                if (name.includes('行') || name.includes('纵') || name.includes('云') || name.includes('飞')) {
                    actions = DODGE_ACTIONS.qinggong;
                }
                const actionsStr = '\tthis.query_dodge_action = function() {\n\t\treturn this.dodge_actions.random();\n\t};\n\tthis.dodge_actions = [\n\t\t"' + actions.join('",\n\t\t"') + '"\n\t];\n';
                // Insert before the closing of the file or before pfms
                if (content.includes('this.pfm')) {
                    newContent = content.replace(/(\tthis\.pfm\s*=)/, actionsStr + '$1');
                } else {
                    newContent = content + '\n' + actionsStr;
                }
                if (newContent !== content) modified = true;
            }
        }

        // 为招架添加parry描述
        if (type === 'parry') {
            if (!content.includes('query_parry_action') && !content.includes('parry_actions')) {
                const actionsStr = '\tthis.query_parry_action = function() {\n\t\treturn this.parry_actions.random();\n\t};\n\tthis.parry_actions = [\n\t\t"' + PARRY_ACTIONS.join('",\n\t\t"') + '"\n\t];\n';
                if (content.includes('this.pfm')) {
                    newContent = content.replace(/(\tthis\.pfm\s*=)/, actionsStr + '$1');
                } else {
                    newContent = content + '\n' + actionsStr;
                }
                if (newContent !== content) modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(fp, newContent, 'utf-8');
            console.log('  ✓ ' + rel);
        }
    }
}

walk(SKILL_DIR, SKILL_DIR);
console.log('\nDone.');
