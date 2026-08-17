this.inherits(ROOM);
this.name = "问心台";
this.desc = "一座由玄青石砌成的八角祭台，每面石壁上各刻着一个古篆：「贪」「嗔」「痴」「慢」「疑」「恶」「欲」「执」。台中央立着一面巨大的铜镜，镜面如水波般微微荡漾。相传此镜能映照出人心最深处的执念与恐惧——那便是每个人自己的心魔。";
this.exits = { "west": "jncz/wangshengjing", "east": "jncz/shengmen" };
this.set_npc([]);
this.xinmo_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("jncz_shengmen")) {
        me.notify("你已通过生门试炼，铜镜恢复了平静，只映出你从容的面容。");
        return;
    }
    if (!this.xinmo_spawned) {
        // 查找副本中的玩家
        var player = null;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].is_player) { player = this.items[i]; break; }
        }
        if (!player) player = me;

        this.xinmo_spawned = true;
        player.notify("<hir>你刚踏上问心台，铜镜骤然爆发出刺目的血光！</hir>");
        player.notify("<hiz>一道与你身形一模一样、却缠绕着黑红煞气的身影从镜中走出——那便是你的心魔！</hiz>");
        player.notify("<hiy>铜镜上浮现出八个古篆，其中最亮的一个正对应着你内心最深的执念。</hiy>");

        var xinmo = NPC.CREATE("jncz/xinmo", this);
        if (xinmo) {
            // 心魔继承玩家的部分属性
            xinmo._player_ref = player;
            xinmo.str = Math.max(2500, Math.floor(player.str * 0.8));
            xinmo.con = Math.max(2500, Math.floor(player.con * 0.8));
            xinmo.dex = Math.max(2500, Math.floor(player.dex * 0.8));
            xinmo.int = Math.max(2500, Math.floor(player.int * 0.8));
            xinmo.recount();
        }
        this.refresh(player);
    }
};

// 清理
this.on_leave = function (me, dir) {
    return true;
};
