	this.inherits(ROOM);
		this.name = "玉皇顶";
		this.desc = "泰山之巅，玉皇顶！站在这里，顿觉天地辽阔，万物渺小。玉皇庙庄严肃穆，香火鼎盛，善男信女络绎不绝。极目远眺，云海茫茫，群峰尽收眼底，令人心潮澎湃。";
		this.exits = { "south": "ts/zhanlutai" };

		this.add_action('wudi_xl', '修炼', function (me) {
		    WORLD.COMMANDS.wudi_xl.enter(me, 'taishan');
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