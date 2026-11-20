	this.inherits(SKILL);
	this.name = "狂风快剑";
	this.id = "kuangfengkuaijian2";
	this.source_skill = "kuangfengkuaijian";
	this.grade = 5;
	this.family = FAMILIES.HUASHAN;
	this.desc = "华山派的剑宗的立宗剑法，以快闻名";
	this.attack_actions = [
	"$N纵身跃起手中$w轻挥，斩向$n后颈",
	"$N手中$w连话三个弧形，向$n的右臂齐肩斩落",
	"$N轻吁一声，刷刷刷刷四剑，向$n胸，腹，腰，肩四处连刺",
	"$N仰天一声清啸，斜行向前，$w横削直击，迅捷无比，击向$n的$l"

];
	this.dodge_actions = [
	"$n一式<HIY>「巨鹏亮翅」</HIY>，两臂鹏举如翼，在剌剌风声中，从$N头顶横跃而过。",
	"$n一式<HIC>「风送紫霞」</HIC>，如一阵清风，舒缓地闪过了$N的凌厉攻势。",
	"$n一式<HIB>「燕回朝阳」</HIB>，轻盈地一跃，一转眼间便绕到了$N的身后。",
	"$n一式<HIY>「却别苍松」</HIY>，一转身间，向后飘出近一丈远",
	"$n一式<HIM>「旭日初升」</HIM>，全身笔直，拔地而起，在半空中一转，已落到几丈远的地方。",
	"$n一式<HIY>「金雁横空」</HIY>，身体如一只金雁般行云流水地滑出丈余。",
	"$n一式<HIW>「晚月朗星」</HIW>，双脚点地，全身化为一道白影，急速绕着$N打了几转。",
	"$n一式<GRN>「幻眼云湮」</GRN>，身形陡地变得飘忽不定，令$N无法看清。",
	"$n一式<HIM>「苍龙盘岭」</HIM>，宛若一条矫矢苍龙，围着$N急速地盘旋了几圈。"
];
	this.can_enables = ["sword", "dodge"];
	this.learn_condition = {
	max_mp: 5000,
	skill: { dodge: 500 }
};
	this.query_enable_prop = function (lv) {
	return {
		dodge: {
				ds: parseInt(lv * 1.9) + 16,
				dex: parseInt(lv * 333.0 / 1000),
				gjsd: 250,   // 攻击间隔缩短 250 毫秒（与一阶一致；原 -250 写反成变慢）
			},
		sword: {
				gj: lv * 2 + 10,
				mz: lv * 2 + 10,
				dex: parseInt(lv * 250.0 / 1000),
				gjsd: 250,   // 攻击间隔缩短 250 毫秒（与一阶一致；原 -250 写反成变慢）
				bj_per: 4,
			},
		}
};

// 夺命连环续发：三剑全中后挂「夺命连环」状态，之后每次攻击结算时再连出三剑，每轮命中递减，任一剑落空即收招。
// 续发写在状态上（而不是技能的面板钩子），融入自创武学后同样生效；命中递减按施展时的等级计算。
function kf_lianhuan(lv, count) {
    return {
        id: "kuangfeng_lianhuan", name: "夺命连环", desc: "三剑全中，快剑如狂风般继续攻出",
        duration: 5000, override: 2, kf_lv: lv, kf_count: count,
        on_attack_over: function (me, target, par) {
            if (!target || target.hp <= 0) return;
            var st = this;
            me.send_room("<hir>$N一击奏效，手中快剑如狂风般继续攻来</hir>\n");
            var isMiss = false;
            var per = 10 - parseInt((st.kf_lv || 0) / 100);
            if (per < 3) per = 3;
            var mz = parseInt(me.mz - me.mz * (st.kf_count - 1) * per / 100);
            if (mz < 0) mz = 0;
            for (var i = 0; i < 3; i++) {
                if (!me.do_attack({ target: target, gj: me.gj, mz: mz, no_append: true })) isMiss = true;
            }
            me.remove_status("kuangfeng_lianhuan", true);
            if (isMiss) me.send_room("<hic>$N一击未能奏效，收招后退</hic>");
            else me.add_status(kf_lianhuan(st.kf_lv, st.kf_count + 1));
            if (par.is_dodge || par.is_parry) me.end_attack(target);
        }
    };
}
	this.pfm = {
	duoming:
	{
		name: "夺命连环",
		distime: 20000,
		enable_skill: "sword",
		mp: 20,
		use: function (me, target, lv) {
				if (me.query_status("kuangfeng_lianhuan")) return me.notify("你的夺命连环还没释放完。");

				me.send_room("<hir>$N一声清啸，手中$W犹如狂风般劈头向$n刺去。</hir>\n", target);
				var isMIss = false;
				for (var i = 0; i < 3; i++) {
				if (!me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
					no_append: true
				})) {
					isMIss = true;
				}
			}
				if (isMIss) {
				me.send_room("<hic>$N一击未能奏效，收招后退</hic>");
			} else {
				me.add_status(kf_lianhuan(lv, 1));
			}
				me.end_attack(target);
		},
		query_desc: function (me, lv) {
				var per = 10 - parseInt(lv / 100);
				if (per < 3) per = 3;
				return"夺命连环三仙剑是剑宗狂风剑法的精髓，瞬间攻出三剑，如果三剑全部命中" + (me.gjsd / 1000) +"秒后会继续触发夺命连环但是命中会降低" + per +"%";
		}
	}
}
