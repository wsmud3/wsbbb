this.inherits(ROOM);
this.name = "密室";
this.desc = "你正处在一个密洞中。这里光线很暗，只能隐隐约约看出地上有些奇花异草。洞壁上嵌着一只<cmd cmd='look xia'>小匣子</cmd>，匣上积满了灰尘。";
this.exits = {
    "east": "yh/midao",
    "west": "yh/xiaojing",
};
this.set_npc(["yh/huawuque", 1]);

// 攻略：在花无缺这个暗道中，注意墙上有个小匣子，打开会有秘籍、黄金等。
//   花无缺守在匣前，须先打倒他；每个副本只能开一次（副本存储）。
//   奖励：黄金 5~20 两 + 移花宫掉落里的随机残页一张（绝情掌/移风剑法/明玉功/移花接木）。
this.yh_open_xia = function (me) {
    if (!me || !me.is_player) return true;
    var hwq = this.find_obj_bypath("yh/huawuque");
    if (hwq && hwq.hp > 0) {
        me.notify("花无缺负手立在小匣子前，淡淡道：「这是移花宫之物。」");
        return true;
    }
    if (this.query_temp(me, "yh_xia_opened")) {
        me.notify("小匣子已经空了。");
        return true;
    }
    this.set_temp(me, "yh_xia_opened", 1);
    me.send_room("$N拂去灰尘，轻轻打开了洞壁上的小匣子。");
    var gold = 5 + Math.floor(Math.random() * 16);
    me.add_obj("money/gold", gold);
    me.notify("<hiy>匣中整整齐齐码着 " + gold + " 两黄金。</hiy>");
    var YH_CANYE = ["book/bc#jueqingzhang", "book/bc#yifengjianfa", "book/bc#mingyugong", "book/bc#yihuajiemu"];
    var page = me.add_obj(YH_CANYE[Math.floor(Math.random() * YH_CANYE.length)]);
    // 写明是哪门武功的残页（带技能颜色），不再只说「一页武功残页」
    var sk = page && page.skill && SKILL.get(page.skill);
    var pname = sk ? (sk.color_name || sk.name) + "<hig>残页</hig>" : (page && page.name) || "武功残页";
    me.notify("<hig>黄金底下还压着一页泛黄的</hig>" + pname + "<hig>！</hig>");
    return true;
};
this.set_item("xia", "小匣子", "洞壁上嵌着的一只小匣子，做工精巧，似乎可以打开。", [
    ["yh_open", "打开", function (me) { return this.yh_open_xia(me); }]
]);

// 碧血照丹青仅困难掉落；困难其余掉落约为普通两倍
this.on_set_difficulty = function (type) {
    if (type !== 1) return;
    var hwq = this.find_obj_bypath("yh/huawuque");
    if (!hwq) return;
    if (this.parent && this.parent.yh_hard_drops) this.parent.yh_hard_drops(hwq);
    hwq.drop_list = (hwq.drop_list || []).concat([hwq.YH_HARD_DROP]);
};
