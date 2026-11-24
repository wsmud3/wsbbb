
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "地候",
    desc: "一人多高的大斧，似如破铜烂铁，但阵阵杀意却直冲脑海"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    prop: {
        gj: 1980,
        str: 440,
        gj_per: 17,
        add_sh_per: 17,
        diff_fy_per: 20,
        desc: "地候：暴击时附加目标2%最大气血的伤害",
    },
});

// 地候：暴击时附加目标 2% 最大气血的伤害。
// 武器的 do_attack 在暴击判定之前调用（引擎读的是 par.iscirt，旧代码读 par.is_cirt 永远为空），
// 所以这里包一层本次攻击的暴击判定函数 par.cirt：引擎做暴击判定时会调用它，判定为暴击后再追加伤害。
// 包装只生效一次，判定后立即还原，不影响同一个 par 的后续目标。
this.do_attack = function (me, target, par) {
    if (!par || !target || !(target.hp > 0)) return 0;
    if (par.cirt && par.cirt._dihou) return 0;
    var orig = par.cirt;
    var wrapped = function (t, part, bj) {
        if (orig) par.cirt = orig; else delete par.cirt;
        var hit = orig ? orig.call(par, t, part, bj) : me.crit(t, part, bj);
        if (hit) {
            try {
                if (t && t.hp > 0) {
                    var dmg = Math.floor(t.max_hp * 2 / 100);
                    if (dmg > 0) {
                        me.send_combat("<HIZ>$N的地候巨斧碎骨一击，$n骨骼尽碎！</HIZ>\n", t);
                        t.damage(dmg, me, 0);
                    }
                }
            } catch (e) {
                console.error("dihou_axe crit error:", e && e.stack || e);
            }
        }
        return hit;
    };
    wrapped._dihou = true;
    par.cirt = wrapped;
    return 0;
};
