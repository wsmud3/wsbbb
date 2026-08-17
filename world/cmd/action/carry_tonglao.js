this.inherits(COMMAND);
this.command = 'carry_tonglao';
this.allow_busy = true;
this.enter = function(me) {
    if (me.query_temp('pm_carry_tonglao')) {
        // 如果temp存在但status丢失（如玩家死亡后复活），重新添加status
        if (!me.query_status('carry_tonglao')) {
            me.add_status({
                id: 'carry_tonglao',
                name: '背负童姥',
                duration: 0,
                desc: '背着童姥，全身内力都用来支撑她，战力大减。',
                prop: { gj_per: -50, mz_per: -50, zj_per: -50, ds_per: -50 }
            });
            return me.notify('<hig>你重新振作，继续背负着童姥前行。</hig>');
        }
        return me.notify('你已经背着童姥了。');
    }
    // 在房间中搜索童姥NPC（路径为 pm/tianshantonglao）
    var tonglao = me.environment.find_obj_bypath('pm/tianshantonglao');
    if (!tonglao) return me.notify('童姥不在这里。');
    tonglao.destroy('童姥跳上了' + me.name + '的背。');
    me.set_temp('pm_carry_tonglao', 1, 7200000);
    me.notify('<hig>童姥轻盈地落在了你的背上。你感觉全身的内力都用来支撑她了，手脚变得沉重起来。</hig>');
    // 攻击 命中 招架 躲闪 减50%
    me.add_status({
        id: 'carry_tonglao',
        name: '背负童姥',
        duration: 0,
        desc: '背着童姥，全身内力都用来支撑她，战力大减。',
        prop: { gj_per: -50, mz_per: -50, zj_per: -50, ds_per: -50 }
    });
};
