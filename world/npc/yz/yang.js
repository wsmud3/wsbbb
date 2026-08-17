	this.inherits(NPC);
	this.set({
	    name: "杨永福",
	    desc: "杨老板是土生土长的扬州人，做了几十年的小买卖。",
	    title: "杂货铺老板",
	    gender: 1,
	    age: 45,
	    per: 22,
	    mp: 1500,
	    max_mp: 1500,
	    hp: 1500,
	    max_hp: 1500,
	});

	this.set_goods("eq/lv0/cloth", "eq/lv0/dao", "eq/lv0/mugun", "eq/lv0/jin", "eq/lv0/shoes", "eq/lv0/ring", "eq/lv0/zan", "eq/lv0/whip", "sp/tool/diao#0", "sp/tool/er#0");

	this.add_action("zsp", "自制饰品", function (me, arg) {
	    this.on_zhizuo(me);
	});

	this.on_zhizuo = function (me, arg) {
	    if (arg == "ok") {
	        var item = me.find_obj_bypath("st/yuanjing");
	        if (!item || item.count < 10) return me.notify("杨永福说道：材料不够就别来烦我。");
	        me.notify("杨永福点头说道：嗯，你想制作什么饰品？");
	        me.send_commands("zhizuo ring", '戒指', "zhizuo necklace", '项链', "zhizuo jewels", '饰品');
	    } else if (!arg) {
	        me.notify("杨永福说道：你能找到10块<hio>元晶</hio>我就帮你制作一件饰品，你要做什么？");
	        me.send_commands("zhizuo ok", "我要制作饰品");
	    } else {
	        var parts = { ring: 1, necklace: 1, jewels: 1 };
	        if (!parts[arg]) return me.notify("杨永福摇头道：我不会制作这种饰品。");
	        me.notify("杨永福说道：告诉我你要制作的饰品的名字。(使用房间频道说出(2-5个汉字)，暴力，色情，政治相关的名字将直接销毁)");
	        me.wait_input = this.zpmake.bind(this, arg);
	        me.send_commands("cancle", '我不制作了');
	    }
	};

	this.zpmake = function (arg, me, str) {
	    if (str == "cancle") {
	        me.notify("杨永福说道：好吧，可惜了。");
	        me.wait_input = null;
	        return;
	    }
	    str = str.split(' ')[1];
	    if (!arg) {
	        me.wait_input = null;
	        return me.notify("杨永福说道：你要告诉我制作什么。");
	    }
	    var parts = { ring: 1, necklace: 1, jewels: 1 };
	    if (!parts[arg]) {
	        me.wait_input = null;
	        return me.notify("杨永福摇头道：我不会制作这种饰品。");
	    }
	    if (!/^[一-龥]{2,5}$/.test(str)) {
	        return me.send('杨永福说道：饰品的名字需要是2-5个汉字。');
	    }
	    if (!UTIL.check_word(str)) {
	        return me.send('杨永福说道：你不能用这个名字。');
	    }
	    var item = me.find_obj_bypath("st/yuanjing");
	    if (!item || item.count < 10) {
	        me.wait_input = null;
	        return me.notify("杨永福说道：材料不够就别来烦我。");
	    }
	    me.wait_input = null;
	    if (me.remove_obj(item, 10)) {
	        var obj = OBJ.CREATE("eq/cp#" + arg);
	        obj.set_temp("name", str);
	        var eq_map = { ring: EQUIP_TYPE.RING, necklace: EQUIP_TYPE.NECKLACE, jewels: EQUIP_TYPE.JEWELS };
	        WORLD.COMMANDS.duanzao.default_template(obj, eq_map[arg]);
	        obj.on_reload(me);
	        me.add_obj(obj);
	        me.notify("杨永福说道：不错，这是你要的。");
	        me.notify("杨永福给你" + obj.unit_name() + "。");
	    }
	};
