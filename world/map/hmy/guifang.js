this.inherits(ROOM);
this.name = "闺房";
this.desc = "东方不败的闺房，绣帷低垂，暗藏杀机。";
this.exits = { "west": "hmy/xiaohuayuan" };

// 用 on_before_enter + 出口检查 来阻止未持有令牌者进入
this.on_before_enter = function(me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (area && area.check_tokens && !area.check_tokens(me)) {
        me.notify('<red>石门紧闭，上有三个凹槽，分别刻着白虎、青龙、风雷图案。你需要集齐三块令牌才能进入。</red>');
        // 把玩家弹回上一个房间
        me.moveto("hmy/xiaohuayuan", '', '被石门弹了回来。');
        return false;
    }
    me.notify('<hig>三块令牌同时发光，石门缓缓打开……东方不败就在里面！</hig>');
};

this.set_npc(["hmy/dongfangbubai", 1]);
this.set_npc(["hmy/yanglianting", 1]);
