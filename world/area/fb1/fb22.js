this.inherits(AREA);
this.set({
    id: "bh",
    name: "冰火岛",
    desc: "北海冰火岛，一半冰川一半火山，极寒与极热并存。金毛狮王谢逊与屠龙刀曾藏于此，岛上火山熔岩中蕴藏着绝世宝物。",
    score: 210,
    is_show: true,
    first: "bh/haibian",
    is_copy: true,
    record_0: true,    // 记录单人通关/扫荡次数（副本次数兑换、橙装次数门槛要用）
    record_1: true,
    expend: 10,
    is_multi: true,
    is_diffi: true,
    hard_scale: 1.86,   // 困难模式 NPC 五维倍率（攻略：普通攻击 1.4 万，困难 2.6 万）
    exp: 28000,
    pot: 24000,
    room_path: "bh/",
    ss_title: "金毛狮王",
    // 困难扫荡额外掉落（屠龙刀仅困难）：bh/hard_drops 只是掉落表载体，不会刷出
    drop_npcs1: ["bh/hard_drops"]
});
				this.map = [
	    // 与原版 fb22 map 应答一致（north = -y），每条连线只从一侧写一次
	    { n: "海边岩石", id: "bh/haibian", p: [0, 0], exits: ["n","w"] },
	    { n: "岩石路", id: "bh/yslu1", p: [-1, 0], exits: ["w"] },
	    { n: "岩石路", id: "bh/yslu2", p: [-2, 0], exits: ["w"] },
	    { n: "火山脚下", id: "bh/huoshanjiao", p: [-3, 0], exits: ["w"] },
	    { n: "火山", id: "bh/huoshan1", p: [-4, 0], exits: [] },
	    { n: "丛林", id: "bh/conglin1", p: [0, -1], exits: ["n"] },
	    { n: "丛林", id: "bh/conglin2", p: [0, -2], exits: ["n"] },
	    { n: "石山", id: "bh/shishan", p: [0, -3], exits: ["n","w"] },
	    { n: "石山", id: "bh/shishan2", p: [-1, -3], exits: [] },
	    { n: "熊洞", id: "bh/xiongdong", p: [0, -4], exits: ["w"] },
	    { n: "小洞", id: "bh/xiaodong", p: [-1, -4], exits: [] },
		];

// ────────────────────────────────────────────────────────────
// 冰火岛机制（全岛共用，房间脚本调用这里）
//   火区（岩石路→火山）：进入及每次房间心跳叠加一层「灼热」（最多 5 层），每层降低
//         防御、闪避，并按层数灼烧气血（最多烧到 1 点，不致死）。
//   冰区（丛林）：进入及每次房间心跳叠加一层「冰寒」（最多 5 层），每层降低攻击、
//         命中，并按层数冻耗内力。身上带着火折子可以在冰区「点火取暖」驱散寒气。
//   冰火相克：进入火区会化掉冰寒，进入冰区会冷却灼热。离开该地带 60 秒后层数自然消散。
//   离开副本时全部清除。
//   火山：搜索玲珑火芝、离火珠，气血须在 50 万以上（攻略），每个副本只能搜一次。
//   困难：小洞里张五侠协助谢逊（见 world/map/bh/xiaodong.js、world/npc/bh/zhangcuishan.js）。
// ────────────────────────────────────────────────────────────
var BH_ICE_ROOMS = { "bh/conglin1": 1, "bh/conglin2": 1 };
var BH_FIRE_ROOMS = { "bh/yslu1": 1, "bh/yslu2": 1, "bh/huoshanjiao": 1, "bh/huoshan1": 1 };
var BH_MAX_STACK = 5;
this.ice_rooms = BH_ICE_ROOMS;
this.fire_rooms = BH_FIRE_ROOMS;

this.bh_zone = function (room) {
    if (!room) return "";
    if (BH_FIRE_ROOMS[room.path]) return "fire";
    if (BH_ICE_ROOMS[room.path]) return "ice";
    return "";
};
// 每次叠加都新建一份（add_status 会改写传入对象）
function bh_fire_buff() {
    return {
        id: "bh_fire", name: "灼热", duration: 60000, downside: true,
        override: 1, max_count: BH_MAX_STACK,
        desc: "火山热浪炙烤全身，每层防御、闪避降低，并持续灼伤气血。",
        prop: { fy_per: -4, ds_per: -3 }
    };
}
function bh_ice_buff() {
    return {
        id: "bh_ice", name: "冰寒", duration: 60000, downside: true,
        override: 1, max_count: BH_MAX_STACK,
        desc: "极地寒气侵入经脉，每层攻击、命中降低，并持续冻耗内力。",
        prop: { gj_per: -4, mz_per: -3 }
    };
}
// 房间 on_enter（entering=true）与房间心跳（entering=false）都调用这里
this.bh_env = function (room, me, entering) {
    if (!me || !me.is_player || me.hp <= 0) return;
    var zone = this.bh_zone(room);
    if (!zone) return;
    var cnt = 0;
    if (zone === "fire") {
        if (me.query_status("bh_ice")) {
            me.remove_status("bh_ice");
            me.notify("<hiy>炙热的火山气息扑面而来，你身上的寒气被一扫而空。</hiy>");
        }
        if (me.query_status("bh_fire") < BH_MAX_STACK) me.add_status(bh_fire_buff());
        cnt = me.query_status("bh_fire");
        if (entering) {
            me.notify("<hir>热浪滚滚，你只觉全身都要被烤熟了！</hir>");
        } else if (cnt > 0) {
            var burn = Math.floor(me.max_hp * 0.01 * cnt);
            if (burn > me.hp - 1) burn = me.hp - 1;
            if (burn > 0) {
                me.add_hp(-burn);
                me.notify("<hir>炙热的气浪灼伤了你，你损失了 " + burn + " 点气血。</hir>");
            }
        }
    } else {
        if (me.query_status("bh_fire")) {
            me.remove_status("bh_fire");
            me.notify("<hic>林中寒气森森，你身上的灼热渐渐消退了。</hic>");
        }
        if (me.query_status("bh_ice") < BH_MAX_STACK) me.add_status(bh_ice_buff());
        cnt = me.query_status("bh_ice");
        if (entering) {
            me.notify("<hic>一股刺骨的寒气从脚底升起，你忍不住打了个寒战。</hic>");
        } else if (cnt > 0) {
            var cost = Math.floor((me.max_mp || 0) * 0.01 * cnt);
            if (cost > me.mp) cost = me.mp;
            if (cost > 0) {
                me.add_mp(-cost);
                me.notify("<hic>寒气侵入经脉，你耗费了 " + cost + " 点内力抵御。</hic>");
            }
        }
    }
};
// 房间心跳：给房间里每个玩家结算一次
this.bh_env_tick = function (room) {
    if (!room || !room.items) return;
    var list = room.items.slice();
    for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].is_player) this.bh_env(room, list[i], false);
    }
};
// 冰区点燃火折子取暖（火折子不消耗）
this.bh_warm = function (room, me) {
    if (!me || !me.is_player) return true;
    if (this.bh_zone(room) !== "ice") { me.notify("这里不冷，用不着取暖。"); return true; }
    var has = false;
    if (me.items) for (var i = 0; i < me.items.length; i++) {
        if (me.items[i] && me.items[i].path === "res/huozhezi") { has = true; break; }
    }
    if (!has) { me.notify("你身上没有火折子，点不起火来。"); return true; }
    if (!me.query_status("bh_ice")) { me.notify("你身上并无寒气，不必取暖。"); return true; }
    me.remove_status("bh_ice");
    me.send_room("$N晃亮火折子，拢起一堆枯枝取暖，身上的寒气渐渐散去。");
    return true;
};

this.on_leaved = function (me) {
    if (!me || !me.remove_status) return;
    me.remove_status("bh_ice");
    me.remove_status("bh_fire");
};

this.drops = [
	    "book/bc#qingfushenfa",
	    "book/bc#qishangquan",
	    "eq/lv4/lihuozhu",
	    "eq/lv5/wushen/tulong_blade",
	    "eq/lv3/longhuozhi",
	    "st/xuanjing",
	    "st/st_blu#1",
	    "st/st_red#1",
	    "st/st_gre#1",
	    "st/st_yel#1",
	    "st/st_yel#2",
	    "st/st_blu#2",
	    "st/st_gre#2"
	];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["book/bc#qingfushenfa", "st/xuanjing"], odds: 2100 },
	    { obj: "book/bc#qishangquan", odds: 2400 },
	    { obj: ["st/st_blu#1", "st/st_red#1", "st/st_gre#1", "st/st_yel#1"], odds: 9300 },
	    { obj: ["eq/lv3/longhuozhi", "st/st_yel#2", "st/st_blu#2", "st/st_gre#2"], odds: 250 },
	    { obj: "eq/lv4/lihuozhu", odds: 90 },
	    { obj: "eq/lv5/wushen/tulong_blade", odds: 17 },
	];
