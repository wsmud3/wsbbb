this.inherits(ROOM);
this.name = "封禅台";
this.desc = "峻极封禅台由大麻石所建，每块大石都凿得极是平整。地势甚为宽阔。这里独立天心，万峰在下，云开日朗，纤翳不生。极目北望，可遥见成皋玉门，黄河有如一线，西向隐隐见到洛阳伊阙，东南都是叠叠重。";
this.exits = {
    "eastdown": "ss/shandao2",
};
this.set_npc([]);

// 五气朝元修炼点（武帝修炼，见 world/cmd/action/wudi_xl.js）
this.add_action('wudi_xl', '修炼', function (me) {
    WORLD.COMMANDS.wudi_xl.enter(me, 'songshan');
});

// 清理离开玩家创建的影子
this.on_leave = function (obj) {
    if (obj.is_player) {
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].is_wudi_shadow && this.items[i].owner_id === obj.id) {
                this.items.splice(i, 1);
            }
        }
    }
};
