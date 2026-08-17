this.inherits(SKILL);
this.name = "基础牛头";
this.id = "niutou";
this.grade = 0;
this.type = SKILL_TYPES.BASE;
this.no_practice = true;
this.set_default(this.id);
this.desc = "基础的牛头功，有意想不到的属性，只能通过向师父学习来提高。";
this.query_prop = lv => ({ int: 5000+lv*10, study_per: 500+lv*10, dazuo_per: 500, lianxi_per: 500+lv*10,dazuo: 1000, releasetime_per: parseInt(1+lv/200), distime_per: 30, add_sh_per: parseInt(1+lv/200), add_bjsh_per: parseInt(1+lv/200), diff_fy_per: parseInt(1+lv/200), diff_sh_per: parseInt(1+lv/200), diff_downside_per: parseInt(1+lv/200), str: lv, dex: lv, con: lv, gj: 100 + lv * 3, mz: 100 + lv * 3, bj_per: parseInt(1+lv/200), gj_per: 10 + parseInt(lv / 200), mz_per: 10 + parseInt(lv / 200), gjsd_per: parseInt(1+lv/200),});
