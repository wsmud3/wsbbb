this.inherits(ROOM);
this.name = "密道";
this.desc = "一条黑暗的密道，伸手不见五指。必须凑齐三块令牌并用火折子照亮，才能打开通往小花园的石门。";
this.exits = { "north": "hmy/houting" };
this.token_gate_open = false;

// 检查玩家是否持有指定名称的物品
function _has_item(me, name) {
    if (!me.items) return false;
    for (var i = 0; i < me.items.length; i++) {
        var it = me.items[i];
        if (it && (it.name === name || it.path === name || (it.__proto__ && it.__proto__.path === name))) {
            return true;
        }
    }
    return false;
}

this.on_enter = function(me) {
    if (!me.is_player) return;
    if (!_has_item(me, '火折子')) {
        me.notify('<red>密道中一片漆黑，你需要火折子才能前进。</red>');
        return;
    }
    var area = this.parent;
    if (area && area.check_tokens && !area.check_tokens(me)) {
        me.notify('<hiy>你点燃火折子，发现前方有一扇石门，上面有三个凹槽，分别刻着白虎、青龙、风雷图案。</hiy>');
        me.notify('<red>你需要集齐三块令牌（白虎令、青龙令、风雷令）才能打开石门。</red>');
        return;
    }
    if (!this.token_gate_open) {
        this.token_gate_open = true;
        this.exits = { "north": "hmy/houting", "east": "hmy/xiaohuayuan" };
        this.exits_changed();
        me.notify('<hig>你点燃火折子，将三块令牌一一插入凹槽！石门缓缓打开，一条通往小花园的路出现在眼前！</hig>');
    }
};

this.add_action("use_huozhezi", "使用火折子", function(me) {
    if (!_has_item(me, '火折子')) {
        me.notify('<red>你没有火折子，无法在黑暗中前进。请先在移花宫副本中获取火折子。</red>');
        return true;
    }
    var area = this.parent;
    if (!area || !area.check_tokens) {
        me.notify('无法检查令牌。');
        return true;
    }
    if (!area.check_tokens(me)) {
        me.notify('<hiy>你点燃火折子，微弱的火光照亮了前方。石门上三个凹槽空空如也——你还需要：</hiy>');
        if (!me.query_temp('hmy_baihu_token')) me.notify('<red>  ✗ 白虎令（击杀白虎护卫房守卫获得）</red>');
        else me.notify('<hig>  ✓ 白虎令</hig>');
        if (!me.query_temp('hmy_qinglong_token')) me.notify('<red>  ✗ 青龙令（击杀青龙护卫房守卫获得）</red>');
        else me.notify('<hig>  ✓ 青龙令</hig>');
        if (!me.query_temp('hmy_fenglei_token')) me.notify('<red>  ✗ 风雷令（击杀风雷护卫房守卫获得）</red>');
        else me.notify('<hig>  ✓ 风雷令</hig>');
        return true;
    }
    if (!this.token_gate_open) {
        this.token_gate_open = true;
        this.exits = { "north": "hmy/houting", "east": "hmy/xiaohuayuan" };
        this.exits_changed();
        me.notify('<hig>三块令牌同时发光，石门缓缓打开！通往小花园的道路出现了！东方不败就在里面……</hig>');
    } else {
        me.notify('石门已经打开了。');
    }
    return true;
});
