	this.inherits(NPC);
	this.name = "铁匠";
	this.title = "铁匠铺老板";
	this.desc = "铁匠正用铁钳夹住一块红热的铁块放进炉中。";
	this.age = 33;
	this.max_hp = 100;
	this.max_mp = 100;
	this.per = 10;
	this.gender = 1;
	this.set_goods("eq/lv0/jian", "eq/lv0/dao", "eq/lv0/tiegun", "eq/lv0/tiezhang", "eq/lv0/fei", "sp/tool/chu#0");
	this.add_action("unxx", "取消镶嵌", function (me, arg) {
	    WORLD.COMMANDS['unxiangqian'].enter(me);
	});
	this.add_action("unjl", "取消精炼", function (me, arg) {
	    WORLD.COMMANDS['unjinglian'].enter(me);
	});
	this.add_action("dz", "锻造武器", function (me, arg) {
	    this.on_duanzao(me);
	});

	this.on_duanzao = function (me, arg) {
	    if (arg == "ok") {
	        var item = me.find_obj_bypath("st/yuanjing");
	        if (!item || item.count < 10) return me.notify("铁匠说道：材料不够就别来烦我。");

	        me.notify("铁匠点头说道：嗯，不错，你想锻造什么武器？");
	        me.send_commands("duanzao sword", '剑', "duanzao blade", '刀', "duanzao club", '棍', "duanzao staff", '杖',
	            "duanzao whip", '鞭', "duanzao none", '拳', "duanzao throwing", '暗器');

	    } else if (!arg) {
	        me.notify("铁匠说道：你能找到10块<hio>元晶</hio>我就免费帮你锻造一把你自己的武器。");
	        me.send_commands("duanzao ok", "我要锻造武器");
	    } else {
	        var is_throwing = (arg === "throwing");
	        if (!is_throwing) {
	            var wtype = WEAPON_TYPE[arg.toUpperCase()];
	            if (!wtype) return me.notify("铁匠摇头道：我不会锻造这种武器。");
	        }
	        me.notify("铁匠说道：告诉我你要锻造的武器的名字。(使用房间频道说出(2-5个汉字)，暴力，色情，政治相关的名字将直接销毁)");
	        me.wait_input = this.dzwq.bind(this, arg);
	        me.send_commands("cancle", '我不锻造了');
	    }
	}

	this.dzwq = function (arg, me, str) {

	    if (str == "cancle") {
	        me.notify("铁匠说道：好吧，可惜了。");
	        me.wait_input = null;
	        me.remove_temp('dz');
	        return;
	    }
	    str = str.split(' ')[1];
	    if (!arg) {
	        me.wait_input = null;
	        return me.notify("铁匠说道：你要先告诉我锻造的武器类型。");
	    }
	    var is_throwing = (arg === "throwing");
	    if (!is_throwing) {
	        var wtype = WEAPON_TYPE[arg.toUpperCase()];
	        if (!wtype) {
	            me.wait_input = null;
	            return me.notify("铁匠摇头道：我不会锻造这种武器。");
	        }
	    }
	    if (!/^[一-龥]{2,5}$/.test(str)) {
	        return me.send('铁匠说道：武器的名字需要是2-5个汉字。');
	    }

	    if (!UTIL.check_word(str)) {
	        return me.send('铁匠说道：你不能用这个名字。');
	    }

	    var item = me.find_obj_bypath("st/yuanjing");
	    if (!item || item.count < 10) {
	        me.wait_input = null;
	        return me.notify("铁匠说道：材料不够就别来烦我。");
	    }
	    me.wait_input = null;
	    if (me.remove_obj(item, 10)) {
	        var obj = OBJ.CREATE("eq/cp#" + arg);
	        obj.set_temp("name", str);
	        var eq_type = is_throwing ? EQUIP_TYPE.THROWING : EQUIP_TYPE.WEAPON;
	        WORLD.COMMANDS.duanzao.default_template(obj, eq_type);
	        obj.on_reload(me);
	        me.add_obj(obj);
	        me.notify("铁匠说道：不错，这是你要的。");
	        me.notify("铁匠给你" + obj.unit_name() + "。");
	    }
	}
