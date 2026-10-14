
const STATS = WORLD.STATS;
const DATA = WORLD.DATA;
DATA.exps = [15, 20, 30, 40, 50, 100, 200, 80, 90, 100, 110, 120, 130];

DATA.stone_values = [1000, 5000, 30000, 150000, 1000000, 10000000];
DATA.book_values = [1, 1000, 5000, 10000, 100000, 500000, 2000000];

DATA.get_exp = function (me) {
    return me.random(5) + this.exps[me.level];
}

DATA.exp100 = function (me) {
    return (me.random(5) + this.exps[me.level]) * 100;
}



const FAMS_TATAS = ['WUDANG', 'HUASHAN', 'SHAOLIN',
    'EMEI', 'GAIBANG', 'XIAOYAO', 'SHASHOU', 'NONE'];
// 使用包装模式避免因文件加载顺序导致 on_save 被覆盖
(function () {
    var _prev = DATA.on_save;
    DATA.on_save = function (str) {
        if (_prev) _prev.call(this, str);
        str.push(',tops:', STATS.saveTops(STATS.TOPS));

        str.push(',score:', STATS.saveScore());

        // str.push(',weapons:', STATS.saveWeapon());
        str.push(',messages:', WORLD.MESSAGE.save());
        str.push(',notices:', WORLD.MESSAGE.saveNotice());

        for (let key of FAMS_TATAS) {
            let tops = STATS['tops_' + key];
            if (tops) {
                str.push(',tops_', key, ':', STATS.saveTops(tops));
            }
        }
        str.push(',eq_stats:', JSON.stringify(STATS.EQ_STATS ?? []));

        str.push(',score_stats:', JSON.stringify(STATS.SC_STATS ?? {}));
    };
})();

// 取角色归属清单遇到异常时缓存 null（表示"未知"）一小段时间，避免启动期或数据库
// 故障时反复查询。未知期间不做任何剔除。
let _fb_local_roles = { at: 0, ids: null };
function collect_local_ids(sid) {
    // 一旦成功取到就锁存：角色创建/删除远少于榜单写入，且丢弃已确认的清单会让
    // 一次 DB 抖动变成误删。取不到时返回 null，调用方一律不做任何改动。
    if (_fb_local_roles.ids) return _fb_local_roles.ids;
    const now = Date.now();
    if (_fb_local_roles.ids === null && now - _fb_local_roles.at < 5000) return null;
    try {
        const roles = WORLD.DB.getLocalRoles(sid);
        if (!Array.isArray(roles)) return null;
        _fb_local_roles = { at: now, ids: new Set(roles.map(r => String(r.id))) };
        return _fb_local_roles.ids;
    } catch (e) {
        _fb_local_roles = { at: now, ids: null };
        console.error('本服角色清单读取失败，本次跳过跨服数据自检：', e && e.message);
        return null;
    }
}
// 世界档案里的排行榜/称号只应包含本服角色。跨服访问或转服遗留会让宿主服档案
// 里出现他服角色（表现为测试服角色出现在正式服排行榜）。取不到角色 id 就无法判断
// 归属，此时一律不剔除，宁可保留也不误删。
// 世界档案里的排行榜/称号只应包含本服角色。跨服访问或转服遗留会让宿主服档案
// 里出现他服角色（表现为测试服角色出现在正式服排行榜）。
//
// 基于对真实档案的实测，这里必须处理三个容易踩空的点：
//   1. 榜单容器是**类数组对象（稀疏数组）**：{"0":{...},...,length:30}，
//      用 Array.isArray() 判断会全部落空（这正是本函数最初完全失效的原因）。
//   2. 字段名大小写不一致：tops / score 是小写，家族榜前缀是 tops_。
//   3. 角色标识字段是 `id`；家族榜条目只有 path（NPC 占位，没有 id），必须保留。
function sanitize_foreign_stats(stats, sid) {
    const local = collect_local_ids(sid);
    // 取不到归属清单就什么都不做：宁可保留数据，也不误删。
    if (!local) return 0;
    // 有 id 就必须属于本服；没有 id（NPC 占位）视为无需处理，保留。
    const belongs = (id) => {
        if (id === undefined || id === null || id === '') return true;
        return local.has(String(id));
    };

    // 稀疏数组（类数组对象）也要遍历
    const each = (list) => {
        if (!list || typeof list !== 'object') return [];
        const len = typeof list.length === 'number' ? list.length : 0;
        const out = [];
        for (let i = 0; i < len; i++) if (list[i]) out.push(list[i]);
        return out;
    };

    let removed = 0;

    // 主榜：档案里是小写 `tops`（代码内叫 TOPS，但系列化名是 tops），只用 name/score 展示
    for (const key of ['tops', 'TOPS']) {
        for (const top of each(stats[key])) {
            if (top.id === undefined || belongs(top.id)) continue;
            delete top.id;
            delete top.userid;
            top.name = '武林高手';
            top.title = null;
            removed++;
        }
    }

    // 家族榜：前缀 tops_，条目通常只有 path（NPC），有 id 才校验
    for (const key in stats) {
        if (key.length <= 5 || key.slice(0, 5) !== 'tops_') continue;
        for (const top of each(stats[key])) {
            if (top.id === undefined || belongs(top.id)) continue;
            delete top.id;
            delete top.userid;
            top.name = '武林高手';
            top.title = null;
            if (top.path === undefined) top.path = 'pub/gaoshou1';
            removed++;
        }
    }

    // 积分榜：档案里是小写 `score`
    for (const key of ['score', 'SCORE']) {
        const list = stats[key];
        if (!list || typeof list !== 'object') continue;
        const len = typeof list.length === 'number' ? list.length : 0;
        for (let i = 0; i < len; i++) {
            const item = list[i];
            if (!item || item.id === undefined || belongs(item.id)) continue;
            delete list[i];
            removed++;
        }
    }

    // 门派积分榜：档案里是小写 `score_stats`
    const famStats = stats.score_stats || stats.SC_STATS;
    if (famStats && typeof famStats === 'object') {
        for (const fam in famStats) {
            const list = famStats[fam];
            if (!list || typeof list !== 'object') continue;
            const len = typeof list.length === 'number' ? list.length : 0;
            for (let i = 0; i < len; i++) {
                const item = list[i];
                if (!item || item.id === undefined || belongs(item.id)) continue;
                delete list[i];
                removed++;
            }
        }
    }

    return removed;
}
DATA._collectLocalIds = collect_local_ids;

DATA.on_load = function (data) {
    WORLD.MESSAGE.load(data);
    this.remove_temp('xy_status');
    this.remove_temp('xy_users');
    this.remove_temp('xy_party');
    STATS.TOPS = STATS.load_tops(data.tops);
    // STATS.WEAPON = data.weapons ?? new Array(20).fill({ "score": 0 });
    STATS.SCORE = data.score ?? Array.from({ length: 20 }, () => ({ "name": "无", "score": 0 }));
    STATS.EQ_STATS = new Array(11);
    data.eq_stats = data.eq_stats ?? [];
    for (let i = 0; i < 11; i++) {
        STATS.EQ_STATS[i] = data.eq_stats[i] ?? Array.from({ length: 10 }, () => ({ "score": 0 }));
    }
    for (let key of FAMS_TATAS) {
        let tops = data['tops_' + key];
        STATS['tops_' + key] =
            STATS.load_tops(tops, FAMILIES[key].name + "弟子", key);
    }
    const sc_stats = data.score_stats ?? {};
    STATS.SC_STATS = {};
    for (let key of FAMS_TATAS) {
        STATS.SC_STATS[key] = sc_stats[key] ??
            Array.from({ length: 20 }, () => ({ "name": "无", "score": 0 }));
    }

    // 剔除世界档案里不属于本服的角色（两服串号的兜底清理）。
    // 若取不到角色归属清单，本函数不做任何改动。
    const stale = sanitize_foreign_stats(STATS, WORLD.SERVERID);
    if (stale) {
        console.log("已剔除" + stale + "条不属于本服(" + WORLD.SERVERID + ")的榜单记录");
    }

    console.log("全局数据已加载");
}
DATA.create_def_tops = function () {
    for (let key of FAMS_TATAS) {
        STATS['tops_' + key] = STATS.load_tops(null, FAMILIES[key].name + "弟子");
    }

}
DATA.create_def_eqs = function () {
    STATS.EQ_STATS = new Array(11);
    for (let i = 0; i < 11; i++) {
        STATS.EQ_STATS[i] = Array.from({ length: 10 }, () => ({ "score": 0 }));
    }
    STATS.EQ_STATS[0] = STATS.WEAPON;
}
DATA.create_def_scs = function () {
    STATS.SCORE = Array.from({ length: 20 }, () => ({ "name": "无", "score": 0 }));
    STATS.SC_STATS = {};
    for (let key of FAMS_TATAS) {
        STATS.SC_STATS[key] = Array.from({ length: 20 }, () => ({ "name": "无", "score": 0 }));
    }
}


DATA.PROPS = {


};

DATA.reset_famtops = function (me, fam) {
    me.remove_temp('top_fam_sc');
    me.remove_temp('top_fam');
    let tops = STATS['tops_' + fam.id];
    if (tops) {
        for (let i = 0; i < tops.length; i++) {
            let user = tops[i];
            if (user.userid === me.id) {
                user.userid = null;
                user.name = fam.name + "弟子";
                user.title = null;
                break;
            }
        }
    }
    tops = STATS.SC_STATS?.[fam.id];
    if (tops) {
        for (let i = 0; i < tops.length; i++) {
            if (tops[i].id === me.id) {
                tops.splice(i, 1);
                break;
            }
        }
    }

}