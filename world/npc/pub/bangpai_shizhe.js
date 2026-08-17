	this.inherits(NPC);
	this.set({
	    name: "帮派使者",
	    desc: "他是负责帮派事务的使者，专门为江湖人士引荐帮派。",
	    gender: 1,
	    age: 35,
	    per: this.random(20) + 15,
	    mp: 500,
	    max_mp: 500,
	    hp: 500,
	    max_hp: 500,
	    no_fight: true
	});
	this.on_kill = function (me) {
	    return false;
	}
	this.set_objects(["eq/lv0/cloth", 1, 1]);

	// 与帮派使者交谈
	this.add_action("talk", "交谈", function (me, par) {
	    if (me.query_temp("pt")) {
	        var pt = me.query_party();
	        var ptName = pt ? pt.name : "";
	        me.notify("帮派使者笑道：「" + me.call() + "，你已经是【" + ptName + "】的人了，直接进去吧，帮会管理员在里面等你。」");
	    } else {
	        me.notify("帮派使者拱手道：「这位" + me.call() + "，可是想加入帮派？天下帮派林立，阁下可在此查看各帮派，择良木而栖。若想自创一番事业，也可创建属于自己的帮派，只需<hiy>500两黄金</hiy>即可。请点击底部<hic>社交</hic>按钮，在弹窗中选择<hic>帮派</hic>标签页操作。」");
	        me.send_commands("party list", "查看帮派列表");
	    }
	});

	// 查看帮派列表
	this.add_action("viewlist", "查看帮派列表", function (me, par) {
	    if (me.query_temp("pt")) {
	        return me.notify("帮派使者笑道：「你已经有帮派了，还想跳槽不成？」");
	    }
	    WORLD.COMMANDS["party"].enter(me, "list");
	});

	// 创建帮派说明
	this.add_action("createinfo", "创建帮派须知", function (me, par) {
	    if (me.query_temp("pt")) {
	        return me.notify("帮派使者皱眉道：「你已经有帮派了，需要先退出才能创建新帮派。」");
	    }
	    me.notify("帮派使者正色道：「创建帮派需要<hiy>500两黄金</hiy>作为建帮基金，帮派名称需<hic>2-5个中文字</hic>。阁下若已准备妥当，请点击底部<hic>社交</hic>按钮，在弹窗中选择<hic>帮派</hic>标签页，即可创建或加入帮派。」");
	});
