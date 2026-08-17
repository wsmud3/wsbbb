this.inherits(ROOM);
this.name = "桃林迷阵";
this.desc = "你身处一片桃花林中，四周的桃树似乎都在缓缓移动。花瓣纷飞，令人目眩神迷，完全分不清东南西北。";
this.exits = { 'north': 'th/mizhen2', 'south': 'th/mizhen3' };

this.mizhen_timer = 0;
this.mizhen_phase = 0;
// 只有特定相位才能通往后山（出口），其余相位在迷阵中循环
this.mizhen_maps = [
    { 'north': 'th/mizhen2', 'south': 'th/mizhen3' },
    { 'east': 'th/mizhen2', 'west': 'th/mizhen3' },
    { 'west': 'th/mizhen2', 'east': 'th/mizhen3' },
    { 'north': 'th/houshan', 'south': 'th/mizhen3' },  // 只有相位3通往出口（后山）！
];

this.on_enter = function(me) {
    if (!me.is_player) return;
    var phase = Math.floor(Date.now() / 30000) % 4;
    this.mizhen_phase = phase;
    this.mizhen_timer = Date.now();
    this.exits = this.mizhen_maps[phase];
    this.exits_changed();
    if (phase === 3) {
        me.notify('<hiy>桃林迷阵暂时露出了通往后山的道路！快走！</hiy>');
    } else {
        me.notify('<hiy>桃花迷阵中方向变幻莫测，每30秒重新排列一次。留意通往后山的出口！</hiy>');
    }
};

this.on_heart_beat = function(dt) {
    var now = Date.now();
    if (now - this.mizhen_timer > 30000) {
        this.mizhen_timer = now;
        this.mizhen_phase = (this.mizhen_phase + 1) % 4;
        this.exits = this.mizhen_maps[this.mizhen_phase];
        this.exits_changed();
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].is_player) {
                if (this.mizhen_phase === 3) {
                    this.items[i].notify('<hiy>桃花迷阵变幻！北面隐约出现了后山的轮廓——出口开了！</hiy>');
                } else {
                    this.items[i].notify('<hiy>桃花迷阵变幻了！方向已重新排列，出口消失了……</hiy>');
                }
            }
        }
    }
};
