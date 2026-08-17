this.inherits(ROOM);
this.name = "峻极峰";
this.desc = "这里是嵩山最高峰——峻极峰，海拔一千五百余米，直插云霄。峰顶有一方天然巨石，石面光滑如镜，传说乃上古仙人修炼之所。四周云雾缭绕，灵禽盘旋，天地灵气之浓郁几乎凝为实质。站在峰顶极目远眺，但见群山俯首，黄河如带，令人顿生「会当凌绝顶，一览众山小」之感。";
this.exits = { "south": "ss/fengshantai" };

this.add_action('wudi_xl', '修炼', function (me) {
    WORLD.COMMANDS.wudi_xl.enter(me, 'songshan');
});

this.on_leave = function (obj) {
    if (obj.is_player) {
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].is_wudi_shadow && this.items[i].owner_id === obj.id) {
                this.items.splice(i, 1);
            }
        }
    }
};
