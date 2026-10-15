// Generate room files for dungeon areas based on fb definitions
const fs = require('fs');
const path = require('path');

const fb_dir = path.join(__dirname, '..', 'world', 'area', 'fb1');
const map_dir = path.join(__dirname, '..', 'world', 'map');

// Exit direction mapping: short -> long
const exit_map = {
    'n': 'north',
    's': 'south',
    'e': 'east',
    'w': 'west',
    'u': 'up',
    'd': 'down',
    'n1d': 'north',
    's1d': 'south',
    'e1d': 'east',
    'w1d': 'west',
    'north': 'north',
    'south': 'south',
    'east': 'east',
    'west': 'west',
    'enter': 'enter',
};

// Reverse direction for bidirectional exits
const reverse_dir = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'up': 'down',
    'down': 'up',
};

// Convert short direction to long
function to_long(d) {
    return exit_map[d] || d;
}

// Reverse a direction
function reverse(d) {
    return reverse_dir[d] || d;
}

// Guess exit direction from coordinate offset
function dir_from_offset(dx, dy) {
    if (dy > 0) return 'north';   // target is north (y higher)
    if (dy < 0) return 'south';   // target is south (y lower)
    if (dx > 0) return 'east';    // target is east (x higher)
    if (dx < 0) return 'west';    // target is west (x lower)
    return null;
}

// Get coordinates from position array
function get_coords(p) {
    return { x: p[0] || 0, y: p[1] || 0 };
}

function parse_fb_file(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const result = {};

    // Extract room_path
    const rp_match = content.match(/room_path:\s*"([^"]+)"/);
    if (rp_match) result.room_path = rp_match[1];

    // Extract map array
    const map_match = content.match(/this\.map\s*=\s*\[([\s\S]*?)\];/);
    if (!map_match) {
        console.log(`No map found in ${filepath}`);
        return null;
    }

    const map_str = map_match[1];
    const rooms = [];

    // Parse each room entry
    const room_regex = /\{\s*n:\s*"([^"]+)"\s*,\s*id:\s*"([^"]+)"\s*,\s*p:\s*\[([^\]]+)\]\s*(?:,\s*exits:\s*\[([^\]]*)\])?\s*\}/g;
    let match;
    while ((match = room_regex.exec(map_str)) !== null) {
        const name = match[1];
        const id = match[2];
        const pos = match[3].split(',').map(s => parseInt(s.trim()));
        const exits_str = match[4] ? match[4] : '';
        const exits_list = exits_str ? exits_str.split(',').map(s => s.trim().replace(/"/g, '')) : [];
        rooms.push({ name, id, pos, exits: exits_list });
    }

    result.rooms = rooms;
    return result;
}

function get_room_neighbors(rooms) {
    // For each room, determine neighbors from coordinate-based exits
    const coord_map = {};
    for (const room of rooms) {
        const [x, y] = room.pos;
        coord_map[`${x},${y}`] = room;
    }

    const result = {};
    for (const room of rooms) {
        const [x, y] = room.pos;
        const exits = {};

        for (const e of room.exits) {
            const norm_e = e.replace(/\d+d?$/, '').replace('1d', '');
            let dx = 0, dy = 0;
            switch (norm_e) {
                case 'n': dy = 1; break;   // north = y+1
                case 's': dy = -1; break;  // south = y-1
                case 'e': dx = 1; break;   // east = x+1
                case 'w': dx = -1; break;  // west = x-1
                default: continue;
            }
            const target_key = `${x + dx},${y + dy}`;
            const target = coord_map[target_key];
            if (target) {
                exits[to_long(norm_e)] = target.id;
            }
        }
        result[room.id] = exits;
    }
    return result;
}

function generate_room_file(room, exits, room_path) {
    const lines = [];
    lines.push('this.inherits(ROOM);');
    lines.push(`this.name = "${room.name}";`);

    // Generate a basic description based on room name
    const desc = generate_desc(room.name);
    lines.push(`this.desc = "${desc}";`);

    if (Object.keys(exits).length > 0) {
        const exit_lines = Object.entries(exits).map(([dir, target]) => {
            return `    "${dir}": "${target}"`;
        });
        lines.push('this.exits = {');
        lines.push(exit_lines.join(',\n'));
        lines.push('};');
    } else {
        lines.push('this.exits = {};');
    }

    return lines.join('\n') + '\n';
}

function generate_desc(name) {
    const descs = {
        '大门': '一座气势恢宏的大门矗立在前，门前石狮威武庄严。',
        '大院': '宽阔的院落，青石铺地，四周回廊环绕。',
        '大厅': '宽敞气派的大厅，雕梁画栋，陈设考究。',
        '走廊': '一条长长的走廊，两侧挂着字画。',
        '走廊尽头': '走廊走到了尽头，前方豁然开朗。',
        '木桩': '一片练功场地，地上立着许多木桩。',
        '金蛇郎君处': '一间幽静的密室，壁上刻着金蛇剑法的心法口诀。',
        '练武场': '一片开阔的练武场地，摆放着各种兵器。',
        '南院': '南面的院落，种着几株花草。',
        '西房': '西边的厢房，布置简洁。',
        '练毒室': '一间阴森的房间，摆满了瓶瓶罐罐。',
        '花园': '一处精心打理的花园，繁花似锦。',
        '后殿': '寺庙后方的殿宇，幽静庄严。',
        '前厅': '气派的前厅，迎接来客之所。',
        '山路': '一条蜿蜒的山路通向山顶。',
        '见性峰': '恒山见性峰，云雾缭绕，景色壮丽。',
        '山门': '寺院的山门，古朴庄严，门楣上刻着大字。',
        '松风观': '松风观掩映在松林之中，古朴幽静。',
        '上清殿': '上清殿内香火缭绕，供奉着道教神位。',
        '卧室': '一间舒适的卧房，陈设雅致。',
        '刘府大门': '刘府的大门，门前挂着红灯笼。',
        '刘府大院': '刘府的院子，张灯结彩，喜气洋洋。',
        '刘府大厅': '刘府的大厅，金碧辉煌，宾客满堂。',
        '刘府后厅': '刘府的后厅，相对安静。',
        '祝融殿': '衡山祝融殿，供奉着火神祝融。',
        '石路': '一条青石铺成的山路，蜿蜒向上。',
        '玉皇顶': '泰山之巅玉皇顶，一览众山小。',
        '太室阙': '嵩山太室阙，古朴威严。',
        '中岳大殿': '嵩山中岳大殿，气势磅礴。',
        '峻极山门': '峻极禅院的山门，庄严肃穆。',
        '峻极禅院': '峻极禅院内禅意深远，松柏森森。',
        '中门': '一道朱红的中门，通往内院。',
        '会盟堂': '五岳会盟堂，气势恢宏。',
        '封禅台': '嵩山封禅台，高耸入云。',
        '密林': '茂密的树林，遮天蔽日。',
        '沼泽地': '一片泥泞的沼泽地，雾气弥漫。',
        '芦苇荡': '茂密的芦苇荡，随风摇曳。',
        '沼泽深处': '沼泽深处，四周一片死寂。',
        '洪荒古泽': '洪荒古泽，仿佛回到了远古时代。',
        '海滩': '一片金色的沙滩，海浪轻拍着海岸。',
        '山洞': '一个幽深的山洞，不知通往何处。',
        '桃花阵': '一片桃花林，落英缤纷，暗藏玄机。',
        '试剑亭': '一座雅致的亭子，供人试剑论武。',
        '前院': '前院花木扶疏，幽静雅致。',
        '练功房': '一间宽敞的练功房。',
        '门廊': '一条幽长的门廊。',
        '长廊': '一条长长的走廊，通向深处。',
        '药房': '药房里摆满了各种药材。',
        '草丛': '茂密的草丛，隐藏着危险。',
        '岩洞': '一个幽深的岩洞，阴森可怖。',
        '入口': '一条小路通向深处。',
        '左星宿海': '星宿海左侧，毒雾弥漫。',
        '右星宿海': '星宿海右侧，毒虫遍地。',
        '中星宿海': '星宿海中央，机关重重。',
        '日月洞': '日月洞内阴森诡异。',
        '海岩石': '海边的巨岩，浪花飞溅。',
        '火山路': '一条通往火山口的崎岖山道。',
        '火山脚下': '火山脚下，热气蒸腾。',
        '火山口': '火山口冒着浓烟，岩浆翻涌。',
        '丛林': '茂密的丛林，毒虫遍野。',
        '石山': '一座光秃秃的石山。',
        '山道': '一条崎岖的山路，蜿蜒向上。',
        '花径': '一条铺满鲜花的小径。',
        '前庭': '宽敞的前庭，花团锦簇。',
        '邀月宫': '邀月宫，清冷如月。',
        '涟星宫': '涟星宫，星光点点。',
        '暗道': '一条幽暗的密道。',
        '岸边': '燕子坞对岸，烟波浩渺。',
        '庄府': '参合庄的大门，气派非凡。',
        '小径': '一条幽静的小径。',
        '云锦楼': '云锦楼高耸入云。',
        '小亭': '一座别致的小亭。',
        '书房': '书房内藏书万卷。',
        '后庭': '后庭院落，幽静雅致。',
        '山谷': '一处幽静的山谷。',
        '白虎堂': '白虎堂，肃杀之气扑面。',
        '青龙堂': '青龙堂，威严庄重。',
        '树林': '一片阴森的树林。',
        '风雷堂': '风雷堂，气势逼人。',
        '悬崖': '陡峭的悬崖，深不见底。',
        '密道': '一条秘密通道。',
        '小花园': '小巧精致的花园。',
        '闺房': '一间精致的闺房。',
        '山脚': '缥缈峰山脚，高耸入云。',
        '断魂崖': '断魂崖上，雾气缭绕。',
        '石足岩': '石足岩，怪石嶙峋。',
        '百丈涧': '百丈涧，深不见底。',
        '仙愁门': '仙愁门，云雾缥缈。',
        '闭关石': '闭关石，传说高人闭关之处。',
        '半山亭': '半山腰的凉亭，可歇脚观景。',
        '半山腰': '光明顶半山腰，道路崎岖。',
        '林间小屋': '林间一座简陋的小屋。',
        '光明顶': '明教总舵光明顶，气势恢宏。',
        '厚土坊': '厚土旗的坊堂。',
        '巨木坊': '巨木旗的坊堂。',
        '洪水坊': '洪水旗的坊堂。',
        '锐金坊': '锐金旗的坊堂。',
        '烈火坊': '烈火旗的坊堂。',
        '圣火坊': '圣火坊，圣火熊熊燃烧。',
        '舍利塔': '舍利塔高耸入云。',
        '无我阁': '无我阁，禅意深远。',
        '无常阁': '无常阁，肃穆庄严。',
        '无乐阁': '无乐阁，寂静无声。',
        '无净阁': '无净阁，超凡脱俗。',
        '崇圣殿': '崇圣殿，金碧辉煌。',
        '般若堂': '般若堂，智慧如海。',
        '牟尼堂': '牟尼堂，佛光普照。',
        '山口': '一条通往山谷的山口。',
        '忘忧谷': '忘忧谷中，风景如画。',
        '洞口': '一个幽暗的洞口。',
        '古墓入口': '古墓的入口，阴森幽暗。',
        '后堂': '古墓后堂，寂静无声。',
        '琴室': '琴室内放着一张古琴。',
        '暗河': '地下暗河潺潺流过。',
        '峭壁': '陡峭的岩壁。',
        '平台': '一处平整的石台。',
        '剑冢': '剑冢之中，埋藏着绝世神兵。',
        '论剑': '华山论剑之处，武林圣地。',
        '论剑台': '论剑台上，风云际会。',
        '绝壁': '华山的绝壁，险峻异常。',
        '放生池': '放生池中锦鲤游弋。',
        '大雄宝殿': '大雄宝殿，金碧辉煌。',
        '观音殿': '观音殿，香火鼎盛。',
        '后山崖': '后山的悬崖峭壁。',
        '天僧禅房': '天僧祖师的禅房。',
        '崖底': '悬崖底部，别有洞天。',
        '禅院': '幽静的禅院。',
        '戒律院': '戒律院，执法森严。',
        '藏经阁': '藏经阁内典籍无数。',
        '密室': '一间隐秘的密室。',
        '大门坎子': '关外的第一道关卡，冰雪覆盖。',
        '二门坎子': '关外的第二道关卡，寒风凛冽。',
        '满天星': '满天星斗之下，雪原苍茫。',
        '谷草跺': '谷草垛旁，积雪深厚。',
        '白河': '白河冰封，寒气逼人。',
        '小屋': '一间简陋的小木屋。',
        '黑风口': '黑风口，狂风怒号。',
        '小天池': '小天池，冰面如镜。',
        '瀑布': '瀑布飞流直下，水雾弥漫。',
        '松花江': '松花江畔，冰雪覆盖。',
        '雪地': '茫茫雪地，一望无际。',
        '山神庙': '一座破旧的山神庙。',
    };
    return descs[name] || `${name}。`;
}

function main() {
    const fb_files = fs.readdirSync(fb_dir).filter(f => f.match(/^fb\d+\.js$/)).sort();

    let total_rooms = 0;
    let created = 0;
    let skipped = 0;

    for (const fb_file of fb_files) {
        const filepath = path.join(fb_dir, fb_file);
        const data = parse_fb_file(filepath);
        if (!data || !data.rooms) continue;

        const room_path = data.room_path;
        if (!room_path) continue;

        const neighbors = get_room_neighbors(data.rooms);

        for (const room of data.rooms) {
            total_rooms++;
            const id = room.id;
            // Remove the room_path prefix to get the filename
            const filename = id.startsWith(room_path) ? id.slice(room_path.length) : id.split('/').pop();
            const dir = path.join(map_dir, room_path.replace(/\/$/, ''));
            const filepath_out = path.join(dir, filename + '.js');

            // Always overwrite to fix exits
            if (fs.existsSync(filepath_out)) {
                skipped++;
                // continue; // Don't skip - overwrite with correct exits
            }

            // Ensure directory exists
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const exits = neighbors[id] || {};
            const content = generate_room_file(room, exits, room_path);

            fs.writeFileSync(filepath_out, '﻿' + content, 'utf8');
            created++;
            console.log(`Created: ${filepath_out}`);
        }
    }

    console.log(`\nDone! Total: ${total_rooms}, Created: ${created}, Skipped (already exist): ${skipped}`);
}

main();
