this.inherits(ROOM);
this.name = "悬崖";
this.desc = "你终于走出了那片阴深的森林，不由长长地舒了口气。可是，一座陡峭的悬崖又立在了你的面前。悬崖上仿佛有座白色的建筑，可云烟缭绕看不清晰。从悬崖上垂下一条绳索。看上去象是悬崖上下互通消息的工具。绳索的上面似乎隐约有一个掉篮,悬崖的墙上似乎有一个<cmd cmd='look xiazi'>匣子</cmd>。";
this.exits = {
    "west": "hmy/shulin",
};

// 描述里内嵌 <cmd cmd='look xiazi'>匣子</cmd>，此处补上对应对象
// TODO: 匣子内容/后续命令待从原版补齐（当前为占位描述）
this.set_item("xiazi", "匣子", "崖边有一个匣子，此处描述待补。", []);

// [mech] 匣子与吊篮（攻略：房间描述「匣子」，插入白虎堂令牌出现吊篮，通过吊篮到下一个悬崖）
this.set_item("xiazi", "匣子", "悬崖的墙上嵌着一个铜匣，匣面有三个凹槽，其中一个刻着白虎纹样。", [
    ["charu", "插入白虎令", null]
]);
this.lan_ready = false;
this.lan_target = "hmy/up12";

this.hmy_have = function (me, p) {
    if (!me.items) return null;
    for (var i = 0; i < me.items.length; i++) {
        var it = me.items[i];
        if (it && it.path === p) return it;
    }
    return null;
};

this.add_action("charu", null, function (me, arg) {
    if (!me.is_player) return true;
    if (this.lan_ready) {
        me.notify("吊篮已经放下来了，坐上去便是。");
        return true;
    }
    var diff = this.query_temp(me, "diff", 0);
    var list = ["res/baihulingpai", "res/qinglonglingpai", "res/fengleilingpai"];
    var names = ["白虎令", "青龙令", "风雷令"];
    var i, it;

    if (diff === 1) {
        // 困难：三令齐上崖（攻略：困难需三个令牌上崖后才能见到3位堂主，然后1v3）
        for (i = 0; i < list.length; i++) {
            if (!this.hmy_have(me, list[i])) {
                me.notify("<hir>匣面上的三个凹槽都要令牌——你还缺「" + names[i] + "」。</hir>");
                return true;
            }
        }
        for (i = 0; i < list.length; i++) me.remove_obj(this.hmy_have(me, list[i]));
        this.lan_ready = true;
        this.lan_target = "hmy/damen";
        me.send_room("$N将三块令牌一并嵌入匣面，吊篮缓缓降下。");
        me.notify("<hig>三令齐鸣，吊篮降下。坐上去便可直上崖顶——崖上有三位堂主候着。</hig>");
        me.send_commands("hmy_lan 1", "乘坐吊篮上崖");
        return true;
    }

    it = this.hmy_have(me, "res/baihulingpai");
    if (!it) {
        me.notify("<hir>你身上没有白虎令。白虎堂堂主上官云身上有一块。</hir>");
        return true;
    }
    me.remove_obj(it);
    this.lan_ready = true;
    me.send_room("$N将白虎令嵌入匣中，咔的一声，一条吊篮自崖顶垂下。");
    me.notify("<hig>白虎令入匣，吊篮垂下。坐上去便能到下一处悬崖。</hig>");
    me.send_commands("hmy_lan 1", "乘坐吊篮");
    return true;
});

this.add_action("hmy_lan", null, function (me, arg) {
    if (!me.is_player) return true;
    if (!this.lan_ready) {
        me.notify("吊篮还没有放下来。");
        return true;
    }
    me.send_room("$N跨进吊篮，绞索吱呀作响，缓缓升上崖去。");
    me.moveto(this.lan_target);
    return true;
});

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.lan_ready) me.send_commands("hmy_lan 1", "乘坐吊篮");
};
