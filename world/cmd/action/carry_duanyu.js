this.inherits(COMMAND);
this.command = 'carry_duanyu';
this.allow_busy = true;
this.enter = function(me) {
    if (me.query_temp('tl_carry_duanyu')) return me.notify('你已经背着段誉了。');
    var duanyu = me.environment.find_obj_bypath('tl/duanyu');
    if (!duanyu) return me.notify('段誉不在这里。');
    duanyu.destroy('段誉跳上了' + me.name + '的背。');
    me.set_temp('tl_carry_duanyu', 1, 7200000);
    me.add_status({
        id: 'carry_duanyu', name: '背负段誉', duration: 0,
        desc: '背着段誉，全身内力都用来保护他，行动极为不便。',
        prop: { str_per: -50, con_per: -50, dex_per: -50, int_per: -50 }
    });
    me.notify('<hig>段誉爬上了你的背。一瞬间，周围所有的僧人全都朝你扑了过来！</hig>');

    var MONKS = ['tl/benchen','tl/benxiang','tl/benguan','tl/bencan','tl/kurongdashi'];
    var ROOM_IDS = ['tl/wule','tl/wuwo','tl/wujing','tl/wuchang','tl/muni'];
    var tid = me.query_teamid();
    var found = 0;

    for (var r = 0; r < ROOM_IDS.length; r++) {
        var base = WORLD.ROOMS[ROOM_IDS[r]];
        if (!base) {
            // 副本房间可能还没创建，现场创建
            base = BASE.CREATE(__PATH.MAP, ROOM_IDS[r]);
            if (!base) continue;
        }
        if (!base.copy_rooms) base.copy_rooms = {};
        var cp = base.copy_rooms[tid];
        if (!cp) {
            // 副本不存在，现场创建
            cp = BASE.CREATE(__PATH.MAP, ROOM_IDS[r]);
            if (cp) { cp.owner = tid; base.copy_rooms[tid] = cp; }
        }
        if (!cp || cp === me.environment) continue;
        for (var j = 0; j < cp.items.length; j++) {
            var npc = cp.items[j];
            if (!npc || npc.is_player || npc.hp <= 0) continue;
            if (MONKS.indexOf(npc.path) === -1) continue;
            npc.moveto(me.environment, '', npc.name + '冲了过来！');
            npc.do_kill(me);
            found++;
        }
    }

    // 当前房间的枯荣
    for (var k = 0; k < me.environment.items.length; k++) {
        var n = me.environment.items[k];
        if (n && !n.is_player && n.path === 'tl/kurongdashi' && n.hp > 0) {
            n.do_kill(me); found++;
        }
    }

};
