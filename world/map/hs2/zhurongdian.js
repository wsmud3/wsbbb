this.inherits(ROOM);
this.name = "祝融殿";
this.desc = "祝融殿，又名老圣殿，祠火神祝融。花岗石砌墙，铁瓦覆顶，殿宇凌空傲雪，巍然屹立在衡山绝顶。殿门石楹上刻有: 寅宾日出，峻极于天，殿上有圣德重华的楣额。";
this.exits = {
    "north": "hs2/wangritai",
    "south": "hs2/zhurongfeng",
};
this.set_npc(["hs2/zhurongdian_1", 1]);

// 五气朝元修炼点（武帝修炼，见 world/cmd/action/wudi_xl.js）
this.add_action('wudi_xl', '修炼', function (me) {
    WORLD.COMMANDS.wudi_xl.enter(me, 'hengshan_s');
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
