this.inherits(ROOM);
this.name = "玉皇顶";
this.desc = "此处便是泰山绝顶。这里有一座玉帝观，观前为古登封台，厉代皇帝封禅的仪式都是在这里举行。台下有一无字碑，据说是汉武帝所立。不远处有一石碣，上书「孔子小天下处」。";
this.exits = {
    "southdown": "ts/nantian",
};
this.set_npc([]);

// 五气朝元修炼点（武帝修炼，见 world/cmd/action/wudi_xl.js）
this.add_action('wudi_xl', '修炼', function (me) {
    WORLD.COMMANDS.wudi_xl.enter(me, 'taishan');
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
