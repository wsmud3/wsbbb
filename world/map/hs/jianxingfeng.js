	this.inherits(ROOM);
		this.name = "见性峰";
		this.desc = `见性峰是恒山派的主峰，峰顶白云环绕，如入仙境。一块巨大的岩石上刻着"见性"二字，笔力苍劲。站在峰顶俯瞰，群山如黛，云海翻涌。几棵古松扎根于岩缝之中，枝干遒劲，历经风霜而岿然不动。远处传来尼姑们诵经的声音，清幽祥和。`;
		this.exits = {"west":"hs/xuankongzhandao"};
		this.set_npc(["hs/tianboguang", 1]);

		this.add_action('wudi_xl', '修炼', function (me) {
		    WORLD.COMMANDS.wudi_xl.enter(me, 'hengshan_n');
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