	this.inherits(ROOM);
	this.name = "华山绝顶";
	this.desc = "这里是华山最高一座山峰，登上此处，峰顶四周云雾飘渺，仿佛置身大海，众山犹如海中小岛，环绕着主峰，仿如一朵盛开的莲花。";
	this.exits = { "down": "huashan/luoyan" };

	this.add_action('wudi_xl', '修炼', function (me) {
	    WORLD.COMMANDS.wudi_xl.enter(me, 'huashan');
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