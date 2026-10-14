
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
    const now = Date.now();
    if (_fb_local_roles.ids && now - _fb_local_roles.at < 60000) return _fb_local_roles.ids;
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
function sanitize_foreign_stats(stats, sid) {
    const local = collect_local_ids(sid);
    if (!local) return 0;
    // 空 id 视为无归属（占位条目）→ 丢弃；查不到的角色也丢弃，但 local 集合是
    // "本服全部角色"，因此正常本服角色不会受影响。
    const belongs = (id) => {
        if (id === undefined || id === null || id === '') return false;
        return local.has(String(id));
    };
    let removed = 0;
    // 显式列出榜单字段：注意主榜字段名是大写 TOPS，不能用大小写敏感的前缀正则匹配。
    const topKeys = ['TOPS'];
    for (const key in stats) {
        if (key.length > 5 && key.slice(0, 5) === 'tops_' && Array.isArray(stats[key])) topKeys.push(key);
    }
    for (const key of topKeys) {
        const list = stats[key];
        if (!Array.isArray(list)) continue;
        for (const top of list) {
            if (!top || !top.userid || belongs(top.userid)) continue;
            // 保留名次占位，只把归属信息清空，避免打乱后续名次计算。
            top.userid = null;
            top.name = '武林高手';
            top.title = null;
            removed++;
        }
    }
    if (stats.SC_STATS && typeof stats.SC_STATS === 'object') {
        for (const fam in stats.SC_STATS) {
            const list = stats.SC_STATS[fam];
            if (!Array.isArray(list)) continue;
            stats.SC_STATS[fam] = list.filter(x => !x || belongs(x.id ?? x.userid));
            removed += list.length - stats.SC_STATS[fam].length;
        }
    }
    for (const key of ['SCORE', 'SC']) {
        const list = stats[key];
        if (!Array.isArray(list)) continue;
        stats[key] = list.filter(x => !x || belongs(x.id ?? x.userid));
        removed += list.length - stats[key].length;
    }
    return removed;
}
// 仅供 tools/test_server_isolation.js 直接引用实现做行为验证。
DATA._sanitizeStats = sanitize_foreign_stats;
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