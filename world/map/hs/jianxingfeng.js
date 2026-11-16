this.inherits(ROOM);
this.name = "见性峰";
this.desc = "这里是恒山主峰见性峰顶的广场。在这里俯瞰群山，才理会的何以衡山是华夏北方万山之宗，这里也是威震江湖的衡山派的根本重地。";
this.exits = {
    "north": "hs/baiyunan",
    "southdown": "hs/beiyuedian",
};
this.set_npc(["hs/npc04", 1], ["hs/jianxingfeng_1", 1], ["hs/bujie", 1]);

// 五气朝元修炼点（武帝修炼，见 world/cmd/action/wudi_xl.js）
this.add_action('wudi_xl', '修炼', function (me) {
    WORLD.COMMANDS.wudi_xl.enter(me, 'hengshan_n');
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
