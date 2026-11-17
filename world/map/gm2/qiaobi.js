this.inherits(ROOM);
this.name = "峭壁";
this.desc = "暗河尽头是一面湿滑的峭壁，头顶隐约有光，上面像是有一处平台。你浑身湿透，被激流冲得气血翻涌。";
// 只能退回暗河；上平台必须「纵身跃上」（原先 south 直通平台，绕过了这一步）
this.exits = { "south": "gm2/anhe" };
this.set_npc([]);

// 攻略：游出暗河后「然后回血，跳上去」——气血回满才跳得上去。
this.add_action("climb_up", "纵身跃上", function (me) {
    if (!me.is_player) return true;
    if (me.is_fighting && me.is_fighting()) {
        me.notify("你正在战斗，待会再说。");
        return true;
    }
    if (me.hp < me.max_hp) {
        me.notify("<red>你被暗流冲得气血翻涌，提不起这口气——先运功把气血回满再跳。</red>");
        return true;
    }
    me.notify("<hig>你提一口气，足尖在峭壁上连点数下，翻身跃上了平台。</hig>");
    me.moveto("gm2/pingtai", me.name + "跃上峭壁走了。", me.name + "从峭壁下跃了上来。");
    return true;
});
