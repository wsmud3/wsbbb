this.inherits(ROOM);
this.name = "后厅";
this.desc = "这里是慕容家里商议事情的地方，不是慕容弟子最好不要到这里来。在后堂正中摆放着一个香案，上面摆放着一个<cmd cmd='look pai'>灵位牌子</cmd>，在正中墙上挂着一幅百鸟朝奉图，边墙上挂着一口宝剑。东西两面各是一间厢房，南面是内堂。";
this.exits = {
    "south": "yz2/dating",
    "east": "yz2/neitang",
};
this.set_npc("yz2/abih");   // 贴身丫环 阿碧

// 描述里内嵌 <cmd cmd='look pai'>牌匾</cmd>，此处补上对应对象
// TODO: 牌匾原文待从原版补齐（当前为占位描述）
this.set_item("pai", "牌匾", "厅上悬着一块牌匾，字迹古朴，此处文字待补。", []);

// [mech] 灵位牌子：拜祭三次 → 还施水阁现世；再回后亭 → 慕容博叫杀（攻略原文）
var _pai = null;
for (var _i = 0; _i < (this.hidden_items || []).length; _i++) {
    if (this.hidden_items[_i].id === "pai") _pai = this.hidden_items[_i];
}
if (_pai) {
    _pai.desc = "后堂正中香案上供着一块灵位牌子，上刻「大燕皇族列祖列宗之位」，香烟缭绕，常年不断。";
    _pai.commands = [["jibai", "拜祭灵位", null]];
    _pai.json = null;
}

this.yz2_open_huanshi = function (me) {
    if (me.query_temp("yz2_huanshi")) return;
    me.set_temp("yz2_huanshi", 1);
    this.add_exit("north", "yz2/huanshi");
    this.notify("<hiz>灵位后的墙壁发出沉闷的机关声，一道水阁缓缓自墙后升起——「还施水阁」现世了！</hiz>");
    this.exits_changed();
    this.refresh(me);
};

this.add_action("jibai", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("yz2_huanshi")) {
        me.notify("还施水阁已经开启，向北进去便是。");
        return true;
    }
    var n = me.query_temp("yz2_jibai", 0) + 1;
    me.set_temp("yz2_jibai", n);
    if (n < 3) {
        me.notify("<hiw>你对着灵位深深拜祭。（第" + n + "次）</hiw>");
        return true;
    }
    me.notify("<hiw>你第三次伏地叩首，额头触地的一刹那，香案上的烛火猛地一跳。</hiw>");
    this.yz2_open_huanshi(me);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("yz2_huanshi") && !this.query_exits("north")) {
        this.add_exit("north", "yz2/huanshi");
    }
    if (!me.query_temp("yz2_huanshi_searched")) return;
    if (me.query_temp("yz2_murongbo_dead")) return;
    if (this.find_obj_bypath("yz2/murongbo")) return;
    var npc = NPC.CREATE("yz2/murongbo", this);
    this.refresh(me);
    if (npc) {
        this.notify("<hir>灵位旁阴影一闪，一个枯瘦的老者缓步走出：「大燕复国之物，岂容外人窥探。」</hir>");
        npc.do_kill(me);
    }
};
