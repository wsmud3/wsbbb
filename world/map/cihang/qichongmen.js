this.inherits(ROOM);
this.name = "七重门";
this.desc = "穿过竹林，眼前赫然出现七座巨大的石门，呈环形矗立。每座门上各刻着一个古篆——「生」「老」「病」「死」「爱别离」「怨憎会」「求不得」——这便是传说中的七重门。门后迷雾翻涌，看不清去路，唯有凭借直觉与勇气方能穿越。";
this.exits = { "west": "cihang/shangyuting", "east": "cihang/tingyuting", "south": "cihang/zhulin" };
this.set_npc([]);

var PATH_A = ["down", "down", "left", "up", "left", "right", "down", "down"];
var PATH_B = ["down", "down", "down", "right", "up", "left", "right", "down"];
var DIR_MAP = { "上": "up", "下": "down", "左": "left", "右": "right" };
var GATES = ["生", "老", "病", "死", "爱别离", "怨憎会", "求不得"];

this.add_action("start_maze", "踏入七重门", function (me) {
    if (me.query_temp("qcm_step") !== undefined) {
        me.notify("你已在七重门之中。当前进度：第" + (me.query_temp("qcm_step") + 1) + "步。");
        return true;
    }
    if (me.query_temp("cihang_route")) {
        me.notify("你已穿越过七重门，无需再次踏入。");
        return true;
    }
    me.set_temp("qcm_step", 0);
    me.set_temp("qcm_path", 0);
    me.notify("<hiy>你深吸一口气，踏入七重门之中。迷雾翻涌，七座石门在四周若隐若现。</hiy>");
    me.notify("<hiw>你需要选择方向前行：上、下、左、右。每一步都须谨慎，走错一步便将前功尽弃。</hiw>");
    return true;
});

["上", "下", "左", "右"].forEach(function (dir) {
    this.add_action("maze_" + dir, "往" + dir, function (me) {
        var step = me.query_temp("qcm_step");
        if (step === undefined) {
            return me.notify("你尚未踏入七重门，请先「踏入七重门」。");
        }
        if (step >= 8 || me.query_temp("cihang_route")) {
            return me.notify("你已穿越七重门！向西前往赏雨亭赴约吧。");
        }
        var d = DIR_MAP[dir];
        var currentPath = me.query_temp("qcm_path", 0);
        var valid = false;

        if (currentPath === 0) {
            if (step <= 1 && d === "down") valid = true;
            else if (step === 2 && d === "left") { valid = true; me.set_temp("qcm_path", 1); }
            else if (step === 2 && d === "down") { valid = true; me.set_temp("qcm_path", 2); }
        } else if (currentPath === 1 && PATH_A[step] === d) {
            valid = true;
        } else if (currentPath === 2 && PATH_B[step] === d) {
            valid = true;
        }

        if (valid) {
            var newStep = step + 1;
            me.set_temp("qcm_step", newStep);
            var gateIdx = (newStep - 1) % 7;
            me.notify("<hig>你穿过「" + GATES[gateIdx] + "」门，迷雾渐散。第" + newStep + "步……</hig>");

            if (newStep >= 8) {
                var npc = Math.random() < 0.5 ? "lang" : "pang";
                var npcName = npc === "lang" ? "浪翻云" : "庞斑";
                me.set_temp("cihang_route", npc);
                me.notify("<hir>七重门尽头，迷雾骤然散去！一道身影从最后一座石门后缓缓走出——「" + npcName + "」！</hir>");
                me.notify("<hiy>" + npcName + "看了你一眼，淡淡说道：'既有缘到此，来赏雨亭一叙吧。'</hiy>");
                me.notify("<hiw>你心中了然——向西前往赏雨亭。</hiw>");
            }
        } else {
            var dmg = Math.floor(me.max_hp * 0.1);
            if (dmg < 100000) dmg = 100000;
            me.damage2(dmg, null);
            me.set_temp("qcm_step", 0);
            me.set_temp("qcm_path", 0);
            me.notify("<red>一步踏错，石门中涌出的罡风扑面而来！你被震退" + dmg + "点气血，回到了七重门入口。</red>");
            me.notify("<hir>前功尽弃，需重新开始。记住——心定则路明。</hir>");
        }
        return true;
    });
}.bind(this));
