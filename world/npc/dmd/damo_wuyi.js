this.inherits(NPC);
this.set({
    name: "达摩·武意化身",
    desc: "达摩祖师面壁九年后留下的武意残影——一道盘膝而坐的金色人影。他周身环绕着淡淡的金光，双眼中透出看透一切的平静。",
    gender: 0,
    level: 1,
    max_hp: 35000000,
    max_mp: 17500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 300000, mz: 250000, zj: 200000, ds: 200000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["unarmed", 3200],
    ["jingangquan", 3200, "unarmed"], ["yijinjing", 3200, "force"], ["hunyuanyiqi", 3200, "force"],
    ["fuhuquan", 3200, "unarmed"], ["weituogun", 3200, "parry"]
);

this.on_die = function(killer) {
    killer.set_temp("dmd_boss_defeated", 1);
    killer.notify("<hig>试炼完成！传承的记忆涌入了你的心神。</hig>");
    killer.set_temp("zy_dmd_5", 1);
};
