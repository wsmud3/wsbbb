// Fix critical room files with proper descriptions, NPCs, and actions
// Rebuilding rooms that my gen_fb_rooms.js overwrote with bare-bones versions

const fs = require('fs');
const path = require('path');

const map_dir = path.join(__dirname, '..', 'world', 'map');

// Room definitions with proper content
const room_fixes = {
    // ===== yz/lw/ (树林副本 - fb1) =====
    'yz/lw/shangu.js': {
        name: '山谷',
        desc: '扬州城外的一个小山谷，这里风景还算秀丽，再往里有片很大的森林，人迹罕至。你侧耳倾听，似乎听到不少狼嚎声，你不禁加快了脚步，想快点离开这里。',
        exits: { west: 'yz/lw/milin' },
    },
    'yz/lw/milin.js': {
        name: '密林',
        desc: '你走入树林，这里面树木茂密，杂草丛生，抬头不见天日，你得时刻防备着，说不定突然就有只毒蛇窜了出来。',
        exits: { east: 'yz/lw/shangu', west: 'yz/lw/milin2' },
        npcs: [['yz/lw/she', 2]],
    },
    'yz/lw/milin2.js': {
        name: '密林',
        desc: '你继续深入，这里面树木更加茂密，杂草丛生，抬头不见天日，你小心翼翼的防备着，说不定有更加危险的野兽。',
        exits: { east: 'yz/lw/milin', west: 'yz/lw/milin3' },
        npcs: [['yz/lw/lang', 2]],
    },
    'yz/lw/milin3.js': {
        name: '密林深处',
        desc: '这里是森林的最深处，四周一片死寂，地上散落着白骨，令人毛骨悚然。据说狼群的首领就盘踞在此。',
        exits: { east: 'yz/lw/milin2' },
        npcs: [['yz/lw/langwang', 1]],
    },

    // ===== bj/slj/ (神龙教副本 - fb9) =====
    'bj/slj/haitan.js': {
        name: '海滩',
        desc: '这里是蛇岛北岸的一片沙滩，海风徐徐，浪花轻拍着礁石。一条小路向南延伸，通往岛内深处。',
        exits: { south: 'bj/slj/lin1' },
    },
    'bj/slj/lin1.js': {
        name: '灌木林',
        desc: '一片茂密的灌木丛，荆棘遍布，毒蛇隐现其间。往南走去似乎有一片竹林。',
        exits: { north: 'bj/slj/haitan', south: 'bj/slj/lin2' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/lin2.js': {
        name: '蛇道',
        desc: '一条蜿蜒曲折的小径，两旁怪石嶙峋，不时有毒蛇从石缝中探出头来。南面是一片空地。',
        exits: { north: 'bj/slj/lin1', south: 'bj/slj/kongdi' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/kongdi.js': {
        name: '空地',
        desc: '一片开阔的空地，一名神龙教弟子在此巡逻放哨。南边通往练武场。',
        exits: { north: 'bj/slj/lin2', south: 'bj/slj/wuchang' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/wuchang.js': {
        name: '练武场',
        desc: '神龙教的练武场，地上摆着石锁和兵器架，四周旌旗飘扬，上书「洪教主仙福永享寿与天齐」。',
        exits: { north: 'bj/slj/kongdi', south: 'bj/slj/shandao' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/shandao.js': {
        name: '山道',
        desc: '一条崎岖的山路蜿蜒向上，拾级而上可见神龙教的山门隐在云雾之中。',
        exits: { north: 'bj/slj/wuchang', south: 'bj/slj/damen' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/damen.js': {
        name: '山门',
        desc: '神龙教的山门以青石筑成，门楣上雕刻着一条张牙舞爪的巨龙，气派非凡。一名弟子在此把守。',
        exits: { north: 'bj/slj/shandao', south: 'bj/slj/qianting' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/qianting.js': {
        name: '前厅',
        desc: '神龙教的前厅，陈设华丽，金漆屏风上绘着百蛇朝圣图。一名弟子在此值守。',
        exits: { north: 'bj/slj/damen', south: 'bj/slj/dating' },
        npcs: [['bj/slj/dizi', 1]],
    },
    'bj/slj/dating.js': {
        name: '大厅',
        desc: '神龙教的正厅，正中一把金龙椅高高在上，洪安通端坐其上，不怒自威，胖头陀与瘦头陀分立左右，教众环伺四周。',
        exits: { north: 'bj/slj/qianting' },
        npcs: [['bj/slj/hong', 1], ['bj/slj/erdangjia', 1], ['bj/slj/sandangjia', 1]],
    },
    'bj/slj/baoku.js': { name: '藏宝阁', desc: '神龙教藏宝之地，金银珠宝堆积如山。', exits: {} },
    'bj/slj/dixia.js': { name: '地下通道', desc: '一条幽暗的地下通道，通往未知之处。', exits: {} },
    'bj/slj/jiaozhu.js': { name: '教主密室', desc: '洪安通的密室，藏着神龙教的秘密。', exits: {} },
    'bj/slj/mishi.js': { name: '密室', desc: '一间隐秘的密室。', exits: {} },
    'bj/slj/sheku.js': { name: '蛇窟', desc: '神龙教养蛇之地，毒蛇遍地。', exits: {} },

    // ===== yz/by/ (兵营副本 - fb5) =====
    'yz/by/damen.js': {
        name: '兵营大门',
        desc: '你正站在兵营的门口，面对着一排简陋的营房，可以看到穿着制服的官兵正在操练，不时地传来呐喊声。老百姓是不允许在此观看的，你最好赶快走开。',
        exits: { south: 'yz/by/bingying' },
        npcs: [['pub/bing', 2]],
        on_leave: `this.on_leave = function (me, dir) {
    if (dir === "south" && this.find_obj_bypath("pub/bing")) {
        me.notify("官兵拦住了你的去路。");
        return false;
    }
}`,
    },
    'yz/by/bingying.js': {
        name: '兵营',
        desc: '这里是兵营，密密麻麻到处都是官兵，有的在武将的指挥下列队操练，有的独自在练功，有的坐着、躺着正在休息。南墙下坐着主帅，不动声色地寻视着四周。看到你进来，他们全都向你包围了过来，形势看来不太妙。南边有一个门。',
        exits: { north: 'yz/by/damen', south: 'yz/by/bingqiku' },
        npcs: [['yz/shiqingshan', 1], ['pub/wujiang', 2]],
    },
    'yz/by/bingqiku.js': {
        name: '兵器库',
        desc: '这里是兵器库，到处银光闪闪，让人眼花缭乱。宝刀、宝剑、金箍棒，大刀、长剑、哨棒，短刀、短剑、短棍，各色各样的兵器应有尽有，你一时不知道挑什么好。',
        exits: { north: 'yz/by/bingying' },
    },
    'yz/by/tongdao.js': {
        name: '地下通道',
        desc: '兵器库通外地下的通道',
        exits: {},
    },

    // ===== yz/cuifu/ (财主家副本 - fb2) =====
    'yz/cuifu/caizhu.js': {
        name: '大门',
        desc: '你来到一座富丽堂皇的大宅院前，两头高大的石狮子镇住了大门两侧，门额上悬挂一方横匾，写着「财主府」几个大字。',
        exits: { north: 'yz/cuifu/dayuan' },
    },
    'yz/cuifu/dayuan.js': {
        name: '大院',
        desc: '你走进大院，迎面是一个假山水池，池中养着各色锦鲤。几个护院在此巡逻，虎视眈眈地看着你。',
        exits: { north: 'yz/cuifu/houyuan', south: 'yz/cuifu/caizhu' },
        npcs: [['yz/cuifu/huyuan', 2]],
    },
    'yz/cuifu/houyuan.js': {
        name: '后院',
        desc: '后院是财主家的内宅所在，东厢和西厢就在此处。几个护院高手守在院中待命。',
        exits: { east: 'yz/cuifu/dongxiang', west: 'yz/cuifu/xixiang', south: 'yz/cuifu/dayuan' },
        npcs: [['yz/cuifu/huyuan2', 1], ['yz/cuifu/caizhu_npc', 1]],
    },
    'yz/cuifu/dongxiang.js': {
        name: '东厢',
        desc: '东厢房是财主家的卧室，一进门就闻到一股浓烈的胭脂味。',
        exits: { west: 'yz/cuifu/houyuan' },
    },
    'yz/cuifu/xixiang.js': {
        name: '西厢',
        desc: '西厢房内陈设雅致，显然是小姐的闺房。',
        exits: { east: 'yz/cuifu/houyuan' },
    },

    // ===== yz/lcy/ (丽春院副本 - fb4) =====
    'yz/lcy/dating.js': {
        name: '大厅',
        desc: '丽春院的大厅，莺歌燕舞，热闹非凡。老鸨在门口迎客，姑娘们在大厅中穿梭。',
        exits: { up: 'yz/lcy/erlou' },
        npcs: [['yz/lcy/laobao', 1]],
    },
    'yz/lcy/erlou.js': {
        name: '二楼',
        desc: '丽春院的二楼，这里比楼下安静不少，是招待贵客的地方。东西两侧各有一间厢房。',
        exits: { west: 'yz/lcy/fang1', east: 'yz/lcy/fang2', down: 'yz/lcy/dating' },
    },
    'yz/lcy/fang1.js': {
        name: '西厢房',
        desc: '西厢房内布置得十分雅致，一张雕花大床占据了半个房间。',
        exits: { east: 'yz/lcy/erlou' },
    },
    'yz/lcy/fang2.js': {
        name: '东厢房',
        desc: '东厢房内珠帘垂挂，暗香浮动，这里是招待贵客的地方。',
        exits: { west: 'yz/lcy/erlou' },
    },
    'yz/lcy/mishi.js': {
        name: '密室',
        desc: '丽春院的密室，藏在二楼隐蔽处，寻常人难以发现。一些朝廷要犯常在此躲避追捕。',
        exits: { east: 'yz/lcy/erlou' },
        npcs: [['yz/lcy/taofan', 3]],
    },

    // ===== yz/lmw/ (流氓巷副本 - fb3) =====
    'yz/lmw/xiangzi1.js': { name: '小巷子', desc: '一条狭窄的小巷子，满地垃圾，散发着一股霉味。', exits: { east: 'yz/lmw/xiangzi2' } },
    'yz/lmw/xiangzi2.js': { name: '小巷子', desc: '巷子深处更加阴暗，几个流氓在此游荡。', exits: { north: 'yz/lmw/pomaowu', east: 'yz/lmw/xiangzi3', west: 'yz/lmw/xiangzi1' }, npcs: [['yz/lmw/liumang', 2]] },
    'yz/lmw/xiangzi3.js': { name: '巷子深处', desc: '巷子的最深处，一座破旧的茅屋隐在角落。', exits: { east: 'yz/lmw/fang', west: 'yz/lmw/xiangzi2' }, npcs: [['yz/lmw/liumang', 2]] },
    'yz/lmw/pomaowu.js': { name: '破茅屋', desc: '一间破旧的茅屋，是流氓们藏东西的地方。', exits: { south: 'yz/lmw/xiangzi2' } },
    'yz/lmw/fang.js': { name: '头目房间', desc: '流氓头目的房间，比外面稍微整洁一些。', exits: { west: 'yz/lmw/xiangzi3' }, npcs: [['yz/lmw/liumangtou', 1]] },
    'yz/lmw/cangku.js': { name: '仓库', desc: '流氓们存放赃物的地方，堆满了各种来路不明的物品。', exits: { north: 'yz/lmw/xiangzi3' } },

    // ===== bj/ao/ (鳌拜府副本 - fb6) =====
    'bj/ao/caizhu.js': { name: '大门', desc: '一座富丽堂皇的大宅院出现在你的眼前，两头高大的石狮子镇住了大门两侧。门额上悬挂一方横匾，写着「满洲第一勇士鳌拜府」几个大字，门外有官兵把守，戒备森严。', exits: { west: 'bj/ao/dayuan' }, npcs: [['pub/bing', 2]] },
    'bj/ao/dayuan.js': { name: '大院', desc: '你走进大院，迎面是一个假山水池，池中立着一块巨大无比的翡翠，显然是鳌拜收刮来的宝物。水池的两旁种满了花草。北边是厨房，西边一条长廊走道通往后院，有几个官兵把守。', exits: { east: 'bj/ao/caizhu', west: 'bj/ao/houyuan', north: 'bj/ao/chufang' }, npcs: [['bj/ao/wu', 1]] },
    'bj/ao/houyuan.js': { name: '后院', desc: '这里是鳌府后院，中心是一个大花园。西边一条长廊走道直通往鳌拜的卧房，有几个官兵把守。北边是书房。南边是鳌拜私设的牢房，牢门是锁着的。', exits: { east: 'bj/ao/dayuan', west: 'bj/ao/woshi', north: 'bj/ao/shufang' }, npcs: [['bj/ao/guanjia', 1], ['bj/ao/jiading', 2]] },
    'bj/ao/dongxiang.js': { name: '书房', desc: '这里是鳌拜书房，却没有一本书。各种古玩琳琅满目，商周青铜、汉瓦当、唐三彩，珍珠宝石，应有尽有，只要拥有一件，就够你吃一辈子了。', exits: { south: 'bj/ao/houyuan' } },
    'bj/ao/xixiang.js': { name: '卧室', desc: '这是鳌拜的卧房。鳌拜躺在床上睡着了，粗声粗气地打着呼噜。', exits: { east: 'bj/ao/dayuan' } },
    'bj/ao/laofang.js': { name: '牢房', desc: '这是一个昏暗的房间，窗户都被钉死。地上放着皮鞭、木棍等刑具，显然这是鳌拜私立公堂，审讯人犯的所在。一个书生被捆在墙上，鲜血淋漓，遍体鳞伤。', exits: { north: 'bj/ao/houyuan' }, npcs: [['bj/ao/zhuangyu', 1]] },

    // ===== bj/zhuang/ (庄府副本 - fb5_5) =====
    'bj/zhuang/xiaolu.js': { name: '小路', desc: '一条蜿蜒的小路通往山间的一座庄园。', exits: { south: 'bj/zhuang/xiaolu2' } },
    'bj/zhuang/xiaolu2.js': { name: '小路', desc: '小路继续向前延伸，前方可见一座大宅院。', exits: { north: 'bj/zhuang/xiaolu', south: 'bj/zhuang/damen' } },
    'bj/zhuang/damen.js': { name: '大门', desc: '庄府的大门紧闭着，门匾上写着一个大大的"庄"字。', exits: { south: 'bj/zhuang/dayuan' } },
    'bj/zhuang/dayuan.js': { name: '大院', desc: '庄府的大院，青石铺地，四周安静得出奇。', exits: { north: 'bj/zhuang/damen', south: 'bj/zhuang/dating' }, npcs: [['bj/zhuang/jiading', 2]] },
    'bj/zhuang/dating.js': { name: '大厅', desc: '庄府的大厅，正中悬着一块金匾，几个妇人正在厅中商议事情。', exits: { north: 'bj/zhuang/dayuan', south: 'bj/zhuang/changlang', east: 'bj/zhuang/dating2', west: 'bj/zhuang/dating1' }, npcs: [['bj/zhuang/furen', 1]] },
    'bj/zhuang/dating1.js': { name: '西厅', desc: '大厅的西侧厅，陈设简朴。', exits: { east: 'bj/zhuang/dating' } },
    'bj/zhuang/dating2.js': { name: '东厅', desc: '大厅的东侧厅，墙上挂着几幅字画。', exits: { west: 'bj/zhuang/dating' } },
    'bj/zhuang/changlang.js': { name: '走廊', desc: '一条长长的走廊通向后方。', exits: { north: 'bj/zhuang/dating', south: 'bj/zhuang/xiaowu' } },
    'bj/zhuang/xiaowu.js': { name: '小屋', desc: '一间简陋的小屋，庄家的妇孺藏身于此。', exits: { north: 'bj/zhuang/changlang' }, npcs: [['bj/zhuang/funu', 3]] },

    // ===== bj/tdh/ (天地会副本 - fb8) =====
    'bj/tdh/andao1.js': { name: '暗道入口', desc: '一条幽暗的密道入口，通往天地会的秘密据点。', exits: { west: 'bj/tdh/andao' } },
    'bj/tdh/neishi.js': { name: '内室', desc: '回春堂的内室，看似普通的药铺后堂，实则暗藏玄机。', exits: { south: 'bj/tdh/andao1' } },
    'bj/tdh/hct.js': { name: '回春堂', desc: '回春堂药铺，门面不大，却是天地会在京城的秘密联络点。', exits: { west: 'bj/tdh/neishi' } },
    'bj/tdh/andao.js': { name: '暗道', desc: '一条长长的暗道，昏暗潮湿，不知通往何处。', exits: { east: 'bj/tdh/andao1', west: 'bj/tdh/andao2' } },
    'bj/tdh/andao2.js': { name: '暗道出口', desc: '暗道走到了尽头，前方是一个大厅。', exits: { east: 'bj/tdh/andao' } },
    'bj/tdh/dating.js': { name: '大厅', desc: '天地会青木堂的大厅，正中挂着"反清复明"的牌匾。', exits: { north: 'bj/tdh/andao2', south: 'bj/tdh/kedian', west: 'bj/tdh/ceting' }, npcs: [['bj/tdh/xu', 1], ['bj/tdh/dizi', 2]] },
    'bj/tdh/ceting.js': { name: '侧厅', desc: '青木堂的侧厅，是堂中弟子议事的地方。', exits: { east: 'bj/tdh/dating' } },
    'bj/tdh/kedian.js': { name: '客店后院', desc: '天地会客店的后院，从大厅穿过即可到达。', exits: { north: 'bj/tdh/dating' } },
    'bj/tdh/kedian3.js': { name: '东客房', desc: '客店的东客房，是招待天地会朋友的地方。', exits: { west: 'bj/tdh/kedian' } },
};

function generate_room(def) {
    const lines = [];
    lines.push('this.inherits(ROOM);');
    lines.push(`this.name = "${def.name}";`);
    lines.push(`this.desc = "${def.desc.replace(/"/g, '\\"')}";`);

    if (def.exits && Object.keys(def.exits).length > 0) {
        const exit_lines = Object.entries(def.exits).map(([dir, target]) => {
            return `    "${dir}": "${target}"`;
        });
        lines.push('this.exits = {');
        lines.push(exit_lines.join(',\n'));
        lines.push('};');
    } else {
        lines.push('this.exits = {};');
    }

    if (def.npcs && def.npcs.length > 0) {
        for (const npc of def.npcs) {
            if (npc.length === 2) {
                lines.push(`this.set_npc(["${npc[0]}", ${npc[1]}]);`);
            } else {
                lines.push(`this.set_npc("${npc[0]}");`);
            }
        }
    }

    if (def.on_leave) {
        lines.push(def.on_leave);
    }

    return lines.join('\n') + '\n';
}

function main() {
    let count = 0;
    for (const [filepath, def] of Object.entries(room_fixes)) {
        const fullpath = path.join(map_dir, filepath);
        const dir = path.dirname(fullpath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const content = '﻿' + generate_room(def);
        fs.writeFileSync(fullpath, content, 'utf8');
        count++;
        console.log(`Fixed: ${filepath}`);
    }
    console.log(`\nFixed ${count} rooms.`);
}

main();
