this.inherits(NPC);
this.set({
    name: "木头人",
    desc: "一个用上等铁木制成的练功木人，身上布满深浅不一的拳印剑痕，是扬州武馆专门放置于此供江湖人士试招之用。",
    gender: 1,
    age: 5,
    per: 20,
    mp: 10,
    max_mp: 10,
    hp: 99999999,
    max_hp: 99999999,
    str: 1,
    con: 1,
    dex: 1,
    int: 1,
    no_fight: true,
    fy: 0,
    mz: 0,
    ds: 0,
    zj: 0
});
this.die = function () {
    this.clear_combat_prop();
    this.add_hp(this.max_hp);
    this.send_room('$N身上的木屑纷纷剥落，转眼间又恢复了原状。\n');
    return false;
};
