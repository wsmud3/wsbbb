this.inherits(ROOM);
this.name = "东厢"
this.desc = "这是一个昏暗的房间，窗户都被钉死。地上放着皮鞭、木棍等刑具，显然这是财主私立公堂，折磨仆人、丫鬟的所在。一个丫鬟被绳子绑着，浑身赤裸跪在地上哭哭啼啼，身上是一道道的伤口。墙角有个<cmd cmd='look gui'>柜子</cmd>，好像放了不少东西。";
this.exits = {  "west": "yz/cuifu/houyuan" };
this.set_npc("yz/cuifu/yahuan");
this.set_item("gui", "柜子", "一个黑乎乎的柜子，里面不知道放了什么。", [[
    "search", "搜索", function (me, par) {
        if (par != "gui") {
            return;
        }
        if (me.query_temp("fb/cuifu/yahuan") == 3) {
            me.send_room("$N仔细翻了翻柜子，从柜子下面找到一个小箱子。");
            me.set_temp("fb/cuifu/yahuan",4);

            // 方案B：开小箱子属于非击杀事件，+10 分，补足 90 -> area.score(100) 的差额；加去重标记
            if (!me.query_temp("cuifu_box")) {
                me.set_temp("cuifu_box", 1);
                me.add_fbscore(10);
                me.notify("<hiy>你从小箱子里摸出几件值钱的物事，悄悄揣进怀里。(副本完成度 +10)</hiy>");
            }
            var obj = me.add_obj("sp/yz/box1", 1);
            if (obj) {
                me.send_room("$N从得到了一个 " + obj.color_name + "。");
            }
        
        } else {
            me.notify("你胡乱在柜子里上面翻了几下，什么都没发现。");
        }
        return true;
    }
]]);