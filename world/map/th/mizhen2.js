this.inherits(ROOM);
this.name = "桃林迷阵";
this.desc = "你身处一片桃花林中，四周的桃树似乎都在缓缓移动。花瓣纷飞，令人目眩神迷，完全分不清东南西北。";
this.exits = {"west":"th/mizhen1","south":"th/mizhen4"};

this.mizhen_timer = 0;
this.mizhen_phase = 0;
this.mizhen_maps = [
    { 'west': 'th/mizhen1', 'south': 'th/mizhen4' },
    { 'north': 'th/mizhen4', 'east': 'th/mizhen1' },
    { 'east': 'th/mizhen4', 'south': 'th/mizhen1' },
    { 'south': 'th/mizhen1', 'west': 'th/mizhen4' },
];

this.on_enter = function(me) {
    if (!me.is_player) return;
    var phase = Math.floor(Date.now() / 30000) % 4;
    this.mizhen_phase = phase;
    this.mizhen_timer = Date.now();
    this.exits = this.mizhen_maps[phase];
    this.exits_changed();
    me.notify('<hiy>桃花迷阵中方向变幻莫测，每30秒重新排列一次。</hiy>');
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
                this.items[i].notify('<hiy>桃花迷阵变幻了！方向已重新排列。</hiy>');
            }
        }
    }
};
