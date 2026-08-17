	this.inherits(ROOM);
	this.name = "山门";
	this.desc = "一座古朴的石牌坊矗立在山道尽头，牌坊上刻着「慈航静斋」四个娟秀的大字。山门虽不宏伟，却自有一股超凡脱俗的仙家气韵。云雾在脚下缭绕，仿佛已置身世外。向北望去，一条青石小径穿过前院，通往静斋深处。";
	this.exits = { "north": "cihang/qianyuan" };
	this.set_npc([]);

	// 防御性清理：玩家从外部重新进入副本时，清理上次未完成遗留的状态
	this.on_enter = function (me) {
	    if (!me.is_player) return;
	    if (me.query_temp("cihang_lanjiang_done")) return;
	    // 有路线、已通过赐教、或任何中途temp残留，都说明上次非正常退出
	    if (me.query_temp("cihang_route") || me.query_temp("cihang_spar_win") || me.query_temp("cihang_lanjiang_kills")) {
	        me.notify("<hiy>你重回慈航静斋山门，之前的试炼记忆随之消散。</hiy>");
	        me.remove_temp("qcm_step");
	        me.remove_temp("qcm_path");
	        me.remove_temp("cihang_route");
	        me.remove_temp("cihang_spar_win");
	        me.remove_temp("cihang_lanjiang_kills");
	        me.remove_temp("cihang_yishu");
	        me.remove_temp("cihang_yishu_got");
	        me.remove_temp("cihang_siguan_ready");
	        me.remove_status("cihang_lanjiang_lock", true);

	        // 重置copy房间的NPC刷新标记，防止旧副本残留的spawned=true导致NPC不再刷新
	        var area = this.parent;
	        var id = area.query_owner(me);
	        if (id && area.rooms) {
	            for (var i = 0; i < area.rooms.length; i++) {
	                var cp = area.rooms[i].query_copy(id);
	                if (cp) {
	                    cp.npc_spawned = false;
	                    cp.guard_spawned = false;
	                    cp.boss_spawned = false;
	                    cp.boss_kill_count = 0;
	                    cp.siguan_active = false;
	                }
	            }
	        }
	    }
	};
