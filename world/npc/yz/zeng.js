	this.inherits(NPC);
	this.set({
	    name: "曾柔",
	    desc: "她是韦爵爷不知道第几房的小妾，在这里开个成衣铺，卖些不知道哪来的衣服。有人说那都是韦爵爷从宫中弄出来的禁品。话这么说，生意照样红活。",
	    gender: 2,
	    age: 25,
	    per: 39,
	    mp: 1500,
	    max_mp: 1500,
	    hp: 1500,
	    max_hp: 1500,
	});
	this.set_goods("eq/lv0/cloth", "eq/lv0/shoes", "eq/lv0/cape", "eq/lv0/head",
	    "eq/lv0/wrist", "eq/lv0/waist");

	this.add_action("cft", "自制防具", function (me, arg) {
	    this.on_caifeng(me);
	});

	this.on_caifeng = function (me, arg) {
	    if (arg == "ok") {
	        var item = me.find_obj_bypath("st/yuanjing");
	        if (!item || item.count < 10) return me.notify("曾柔说道：材料不够就别来烦我。");
	        me.notify("曾柔点头说道：嗯，你想制作什么防具？");
	        me.send_commands("caifeng cloth", '衣服', "caifeng shoes", '鞋子', "caifeng head", '头部',
	            "caifeng cape", '披风', "caifeng wrist", '护腕', "caifeng waist", '腰带');
	    } else if (!arg) {
	        me.notify("曾柔说道：你能找到10块<hio>元晶</hio>我就帮你制作一件防具，你要做什么部位的？");
	        me.send_commands("caifeng ok", "我要制作防具");
	    } else {
	        var parts = { cloth: 1, shoes: 1, head: 1, cape: 1, wrist: 1, waist: 1 };
	        if (!parts[arg]) return me.notify("曾柔摇头道：我不会制作这种防具。");
	        me.notify("曾柔说道：告诉我你要制作的防具的名字。(使用房间频道说出(2-5个汉字)，暴力，色情，政治相关的名字将直接销毁)");
	        me.wait_input = this.cfmake.bind(this, arg);
	        me.send_commands("cancle", '我不制作了');
	    }
	};

	this.cfmake = function (arg, me, str) {
	    if (str == "cancle") {
	        me.notify("曾柔说道：好吧，可惜了。");
	        me.wait_input = null;
	        return;
	    }
	    str = str.split(' ')[1];
	    if (!arg) {
	        me.wait_input = null;
	        return me.notify("曾柔说道：你要告诉我制作什么部位。");
	    }
	    var parts = { cloth: 1, shoes: 1, head: 1, cape: 1, wrist: 1, waist: 1 };
	    if (!parts[arg]) {
	        me.wait_input = null;
	        return me.notify("曾柔摇头道：我不会制作这种防具。");
	    }
	    if (!/^[一-龥]{2,5}$/.test(str)) {
	        return me.send('曾柔说道：防具的名字需要是2-5个汉字。');
	    }
	    if (!UTIL.check_word(str)) {
	        return me.send('曾柔说道：你不能用这个名字。');
	    }
	    var item = me.find_obj_bypath("st/yuanjing");
	    if (!item || item.count < 10) {
	        me.wait_input = null;
	        return me.notify("曾柔说道：材料不够就别来烦我。");
	    }
	    me.wait_input = null;
	    if (me.remove_obj(item, 10)) {
	        var obj = OBJ.CREATE("eq/cp#" + arg);
	        obj.set_temp("name", str);
	        var eq_map = { cloth: EQUIP_TYPE.CLOTH, shoes: EQUIP_TYPE.SHOES, head: EQUIP_TYPE.HEAD,
	            cape: EQUIP_TYPE.CAPE, wrist: EQUIP_TYPE.WRIST, waist: EQUIP_TYPE.WAIST };
	        WORLD.COMMANDS.duanzao.default_template(obj, eq_map[arg]);
	        obj.on_reload(me);
	        me.add_obj(obj);
	        me.notify("曾柔说道：不错，这是你要的。");
	        me.notify("曾柔给你" + obj.unit_name() + "。");
	    }
	};
