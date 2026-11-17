this.inherits(ROOM);
this.name = "论剑台";
this.desc = "这里是华山最高一座山峰，眼前是一方圆数十丈的平台，有一凸起约丈高的石台，岩石上刻着四个大字：【华山论剑】，再上还有一处更加陡峭的<span cmd='look bi'>绝壁</span>，一般人很难再上去了。";
this.exits = {
    "west": "hslj/west",
    "east": "hslj/east",
    "south": "hslj/south",
    "north": "hslj/north",
};
// 五绝不再一次全刷在台上：登台后按 黄药师→一灯大师→欧阳锋→洪七公→王重阳 依次出场（fb31.js）
this.set_npc([]);

function hslj(room) { return room && room.parent && room.parent.hslj_spawn ? room.parent : null; }

this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var a = hslj(this);
    if (a) a.hslj_on_enter(this, me);
};
// 论剑途中离开（凌波溜走 / 逃跑 / 走开）= 中断、完成度清零；不阻止离开
this.on_leave = function (me, dir) {
    var a = hslj(this);
    if (a && me && me.is_player) a.hslj_on_leave(this, me, dir);
    return true;
};

this.set_item("bi", "绝壁", "论剑台上方一面几乎垂直的绝壁，石缝里长着几株老松，隐约能看到有人攀爬过的痕迹。", [
    ["climb_bi", "爬上去", function (me) {
        if (!me.is_player) return true;
        var a = hslj(this);
        if (a && a.hslj_broken(this)) {
            me.notify("论剑已经中断，你心灰意冷，哪还有心思去爬绝壁。");
            return true;
        }
        if (a && !a.hslj_done(this)) {
            me.notify("<red>五绝还没分出胜负，哪有工夫去爬绝壁？</red>");
            return true;
        }
        if (me.is_fighting && me.is_fighting()) {
            me.notify("你正在战斗，待会再说。");
            return true;
        }
        me.notify("<hig>你手足并用，攀着石缝和老松一路爬上了绝壁。</hig>");
        me.moveto("hslj/jueding", me.name + "攀上绝壁不见了。", me.name + "从绝壁下爬了上来。");
        return true;
    }]
]);
