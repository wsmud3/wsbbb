this.inherits(SKILL);
this.name = "黑龙心法";
this.id = "heilongxinfa";
this.grade = 1;
this.force_rad = 0.65;
this.desc = "黑龙会的内功心法，入会便能修炼";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["force"];


this.query_enable_prop = function (lv) {
    return {
        force: {
            fy: lv,
            limit_mp: lv * 10,
            desc: "唯一：将你内力的65%转化为气血"
        }
    };
}

this.learn_condition = {
    skill: {
        force: 30
    }
};

this.pfm = {
    power:
    {
        name: "黑龙护体",
        distime: 30000,
        enable_skill: "force",
        mp: 20,
        release_time: 0,
        use_type: 2,
        use: function (me, target, lv) {

            me.send_room("<hic>$N喉间发出一声低沉吼叫，内息如墨自丹田翻涌而上游走全身！！</hic>");

            const time = 10000 + lv * 10;
            const prop = {
                fy: lv,
            };
            const is_fy = me.query_prop('hl_fy');
            const is_sh = me.query_prop('hl_sh');

            if (is_fy) {
                prop.diff_sh = is_fy;
            }
            me.add_status({
                id: "force",
                name: "黑龙护体",
                desc: "运用黑龙护体，提升自身防御力",
                prop: prop,
                duration: time,
                finish_msg: "$N的黑龙护体运行完毕，将内力收回丹田。",
                // 黑龙反弹（装备带「黑龙反伤」时）：写在状态上（原在黑龙心法的内力卸力钩子里），融入自创武学后照常生效
                on_force_parry: is_sh > 0 ? function (owner, from) {
                    if (!from || from === owner || from.hp <= 0) return 0;
                    owner.send_combat('<blk>$n被$N的黑龙护体反弹了' + is_sh + '点伤害！！</blk>\n', from);
                    from.damage2(is_sh, owner, { kind: "reflect" });
                    owner.end_attack(from);
                    return 0;
                } : undefined,
            });
        },
        query_desc: function (me, lv) {
            var time = (10000 + lv * 10) / 1000;
            var gj = lv;
            return"提升全身潜力，在" + time +"秒内，提升自身防御力" + gj +"点。";
        }
    }
};
