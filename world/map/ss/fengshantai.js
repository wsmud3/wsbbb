	this.inherits(ROOM);
		this.name = "封禅台";
		this.desc = "嵩山之巅，封禅台高耸入云。这里是历代帝王封禅祭天之地，巨大的石台上刻满了古老的铭文。台四周云海翻腾，犹如天河倒挂。极目远眺，中岳七十二峰尽收眼底，气象万千。一道青石台阶自台下延伸而下，两侧古柏苍劲，仿佛守护着这片神圣之地。";
		this.exits = { "south": "ss/damodong", "north": "ss/junjifeng" };

		this.add_action('wudi_xl', '修炼', function (me) {
		    WORLD.COMMANDS.wudi_xl.enter(me, 'songshan');
		});

		// 清理离开玩家创建的影子
		this.on_leave = function (obj) {
		    if (obj.is_player) {
		        for (var i = this.items.length - 1; i >= 0; i--) {
		            if (this.items[i].is_wudi_shadow && this.items[i].owner_id === obj.id) {
		                this.items.splice(i, 1);
		            }
		        }
		    }
		};