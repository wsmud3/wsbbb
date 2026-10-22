this.inherits(ROOM);
this.name = "松花江面";
this.desc = "这里是松花江的江面，冰面早已解冻，清澈的江水涛涛北去，两岸是如烟如雾松支，柳条。船夫悠闲地在船尾把着舵。";
this.exits = {};
this.set_npc([]);

// 原版机制（攻略第 10 节）：回到副本起点，点击西方的江面，船夫收取 1 金渡河费。
// 过河后进入雪地，一路向西直到看见北方有出口，往北走杀死阎基达成 100%。
this.set_item("jiangmian", "松花江面", "江面宽阔，水色浑黄，一眼望不到对岸。", [
    "dujiang", "渡江", function (me) {
        var cf = this.find_obj("kw/chuanfu");
        if (!cf) {
            me.notify("<red>四下没有船夫的影子，无人摆渡。</red>");
            return true;
        }
        me.notify("<hiy>船夫撑起竹篙：「客官，渡河要一文钱。」</hiy>");
        me.add_money(-1);
        me.set_temp("kw_ferry", 1, 7200000);
        me.moveto("kw/xuedi1", me.name + "坐上渡船过了松花江。", me.name + "从渡船上跳下来，踩进厚厚的雪里。");
        me.notify("<hig>船靠岸了，眼前是一片茫茫雪原。</hig>");
        return true;
    }
]);
