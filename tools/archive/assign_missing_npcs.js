// Assign NPCs to dungeons that are missing them entirely
const fs = require('fs');
const path = require('path');

const map_dir = path.join(__dirname, '..', 'world', 'map');
const npc_dir = path.join(__dirname, '..', 'world', 'npc');

// For each dungeon area, define NPC placement: { room_file: [ [npc_path, count], ... ] }
const assignments = {
    // 关外 (fb10) — kw NPCs: chuanfu, heixiong, hufei, jindiao, laohu, pingsi, yanji
    'kw': {
        'damenkanzi.js': [['kw/laohu', 1]],  // tiger at entrance
        'mantianxing.js': [['kw/laohu', 1]],  // more tigers along the way
        'gucaoduo.js': [['kw/heixiong', 1]],  // black bear
        'baihe.js': [['kw/heixiong', 1]],
        'xiaowu.js': [['kw/pingsi', 1]],     // NPC inside the hut
        'milin2.js': [['kw/jindiao', 1]],     // golden eagle
        'heifengkou.js': [['kw/heixiong', 2]], // tough at black wind pass
        'xiaotianchi.js': [['kw/yanji', 1]],
        'xuedi2.js': [['kw/laohu', 2]],
        'shanmiao.js': [['kw/hufei', 1]],     // boss: 胡斐 at the mountain temple
    },

    // 云梦沼泽 (fb18) — ym NPCs: eyu, huolong, huolongwang, yinggu
    'ym': {
        'zhaoze1.js': [['ym/eyu', 2]],       // crocodiles
        'zhaoze2.js': [['ym/eyu', 2]],
        'zhaoze3.js': [['ym/eyu', 2]],
        'zhaoze4.js': [['ym/eyu', 3]],
        'long1.js': [['ym/huolong', 1]],      // fire dragons
        'long2.js': [['ym/huolong', 1]],
        'long3.js': [['ym/huolong', 1]],
        'huangguze.js': [['ym/huolongwang', 1]], // boss: dragon king
    },

    // 桃花岛 (fb19) — th NPCs: huangrong, huangyaoshi, luchengfeng, qulingfeng, zhoubotong
    'th': {
        'taohuazhen1.js': [['pub/muren', 2]],    // wooden puppets in the maze
        'taohuazhen2.js': [['pub/muren', 2]],
        'taohuazhen3.js': [['pub/muren', 2]],
        'shijianting.js': [['th/luchengfeng', 1]], // 陆乘风
        'qianyuan.js': [['th/qulingfeng', 1]],     // 曲灵风
        'woshi.js': [['th/huangyaoshi', 1], ['th/huangrong', 1]], // boss: 黄药师 + 黄蓉
    },

    // 白驼山 (fb20) — bt NPCs: baiyishaonv, mangshe, ouyangfeng, she, xiaoqing
    'bt': {
        'damen.js': [['bt/she', 2]],            // snakes at entrance
        'liangongfang.js': [['bt/she', 2]],
        'menlang.js': [['bt/mangshe', 1]],      // python
        'huayuan.js': [['bt/mangshe', 1], ['bt/xiaoqing', 1]], // python + servant
        'changlang.js': [['bt/she', 2]],
        'yaofang.js': [['bt/baiyishaonv', 1]],   // 白衣少女
        'caocong.js': [['bt/mangshe', 2]],
        'yandong.js': [['bt/ouyangfeng', 1]],    // boss: 欧阳锋
    },

    // 冰火岛 (fb22) — bh NPCs: baixiong, xiexun, yanlong, yanlongwang, zhangcuishan
    'bh': {
        'haiyanshi.js': [['bh/baixiong', 1]],     // polar bear
        'huoshanlu1.js': [['bh/yanlong', 1]],      // fire dragon
        'huoshanlu2.js': [['bh/yanlong', 1]],
        'huoshanjiaoxia.js': [['bh/yanlong', 2]],
        'huoshan.js': [['bh/yanlongwang', 1]],     // boss: dragon king
        'conglin1.js': [['bh/baixiong', 2]],
        'shishan.js': [['bh/xiexun', 1]],           // boss: 谢逊
    },

    // 燕子坞 (fb24) — yz2 NPCs: abih, azhu, baobuton, murongbo, murongfu, wangfuren, wangyuyan
    'yz2': {
        'zhuangfu.js': [['pub/mpguanli', 1]],       // gate guard
        'qianyuan.js': [['yz2/abih', 1], ['yz2/azhu', 1]], // servants
        'dating.js': [['yz2/wangfuren', 1], ['yz2/wangyuyan', 1]], // 王夫人 + 王语嫣
        'yunjinlou.js': [['yz2/murongfu', 1]],       // 慕容复
        'shufang.js': [['yz2/murongbo', 1]],          // boss: 慕容博
    },

    // 黑木崖 (fb25) — hmy NPCs: dongfangbubai, jiabu, shangguanyun, tongbaixiong, yanglianting
    'hmy': {
        'qinglongtang.js': [['pub/bing', 2]],         // guards
        'baihutang.js': [['pub/bing', 2]],
        'fengleitang.js': [['hmy/tongbaixiong', 1]],   // 童百熊
        'shulin.js': [['pub/bing', 2]],
        'xuanya.js': [['hmy/shangguanyun', 1]],        // 上官云
        'damen.js': [['hmy/yanglianting', 1]],          // 杨莲亭 at gate
        'xiaohuayuan.js': [['hmy/jiabu', 1]],           // 贾布
        'guifang.js': [['hmy/dongfangbubai', 1]],       // boss: 东方不败
    },

    // 缥缈峰 (fb26) — pm NPCs: bupingdaoren, liqiushui, tianshantonglao, wudaolaoda, zhuobufan
    'pm': {
        'shanjiao.js': [['pub/muren', 2]],              // guards at base
        'duanhunya.js': [['pm/wudaolaoda', 1]],         // 乌老大
        'shizuyan.js': [['pm/zhuobufan', 1]],           // 卓不凡
        'baizhangjian.js': [['pm/bupingdaoren', 1]],    // 不平道人
        'xianchoumen.js': [['pm/liqiushui', 1]],        // 李秋水
        'biguanshi.js': [['pm/tianshantonglao', 1]],    // boss: 天山童姥
    },

    // 光明顶 (fb27) — gm NPCs: many
    'gm': {
        'shanmen.js': [['gm/zongweixia', 2]],           // guards
        'banshanting.js': [['gm/xianyutong', 1]],       // 鲜于通
        'banshanyao.js': [['gm/zongweixia', 2]],
        'linjianxiaowu.js': [['gm/zhangzhong', 1], ['gm/zhoudian', 1]], // 张中 + 周颠
        'guangmingding.js': [['gm/yangxiao', 1], ['gm/weiyixiao', 1]],  // 杨逍 + 韦一笑
        'houtufang.js': [['gm/yanyuan', 1]],             // 颜垣
        'jumufang.js': [['gm/wencangsong', 1]],          // 闻苍松
        'hongshuifang.js': [['gm/tangyang', 1]],         // 唐洋
        'ruijinfang.js': [['gm/zhuangzheng', 1]],        // 庄铮
        'liehuofang.js': [['gm/xinran', 1]],             // 辛然
        'shenghuofang.js': [['gm/yangdingtian', 1]],     // boss: 阳顶天
    },

    // 天龙寺 (fb28) — tl NPCs: bencan, benchen, benguan, benxiang, duanyu, kurongdashi
    'tl': {
        'sheli.js': [['tl/benguan', 1]],                 // 本观
        'wuwo.js': [['tl/bencan', 1]],                   // 本参
        'wuchang.js': [['tl/benchen', 1]],               // 本尘
        'wule.js': [['tl/benxiang', 1]],                 // 本相
        'chongsheng.js': [['tl/duanyu', 1]],             // 段誉 (visiting)
        'muni.js': [['tl/kurongdashi', 1]],              // boss: 枯荣大师
    },

    // 华山论剑 (fb31) — hslj NPCs: beigai, dongxie, nandi, xidu, zhongshentong
    'hslj': {
        'lunjian.js': [['hslj/beigai', 1], ['hslj/nandi', 1]],         // 北丐 + 南帝
        'lunjiantai.js': [['hslj/dongxie', 1], ['hslj/xidu', 1]],      // 东邪 + 西毒
        'juebi.js': [['hslj/zhongshentong', 1]],                        // boss: 中神通
    },
};

function npc_exists(npc_path) {
    return fs.existsSync(path.join(npc_dir, npc_path + '.js'));
}

function add_npc_to_room(room_path, npcs) {
    let content = fs.readFileSync(room_path, 'utf8');

    for (const [npc, count] of npcs) {
        if (!npc_exists(npc)) {
            console.log(`  WARNING: NPC ${npc} does not exist, skipping`);
            continue;
        }
        const npc_line = `this.set_npc(["${npc}", ${count}]);\n`;
        // Add before the last closing or end of file
        if (content.includes('this.set_npc')) {
            content = content.replace(/(this\.set_npc[^\n]+\n)(?!.*this\.set_npc)/s, `$1${npc_line}`);
        } else if (content.includes('this.exits')) {
            content = content.replace(/(this\.exits[^;]+;)/, `$1\n${npc_line}`);
        } else {
            content += `\n${npc_line}`;
        }
    }

    fs.writeFileSync(room_path, content, 'utf8');
}

function main() {
    let total = 0;
    for (const [area, rooms] of Object.entries(assignments)) {
        console.log(`\n=== ${area} ===`);
        for (const [room_file, npcs] of Object.entries(rooms)) {
            const room_path = path.join(map_dir, area, room_file);
            if (!fs.existsSync(room_path)) {
                console.log(`  MISSING: ${room_file}`);
                continue;
            }
            // Check if room already has NPCs
            const content = fs.readFileSync(room_path, 'utf8');
            const has_npcs = content.includes('this.set_npc(') && !content.includes('this.set_npc([])');

            if (!has_npcs) {
                add_npc_to_room(room_path, npcs);
                console.log(`  + ${room_file}: ${npcs.map(([n,_]) => n).join(', ')}`);
                total++;
            } else {
                console.log(`  SKIP ${room_file}: already has NPCs`);
            }
        }
    }
    console.log(`\nAdded NPCs to ${total} rooms.`);
}

main();
