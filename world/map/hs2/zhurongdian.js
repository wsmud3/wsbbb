	this.inherits(ROOM);
		this.name = "祝融殿";
		this.desc = "衡山之巅，祝融殿巍然矗立。殿内供奉着火神祝融的神像，通体赤红，手持火焰令箭，威严赫赫。殿中热气蒸腾，仿佛地火在脚下涌动。透过殿窗远眺，七十二峰如碧螺般散落云海之中。殿前的古松虬枝盘曲，似火龙腾空。";
		this.exits = { "south": "hs2/zhulin" };

		this.add_action('wudi_xl', '修炼', function (me) {
		    WORLD.COMMANDS.wudi_xl.enter(me, 'hengshan_s');
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