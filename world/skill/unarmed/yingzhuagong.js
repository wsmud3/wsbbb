this.inherits(SKILL);
this.name = "鹰爪功";
this.id = "yingzhuagong";
this.grade = 2;

this.attack_actions = [
	"$N全身拔地而起，半空中一个筋斗，一式「苍鹰袭兔」，迅猛地抓向$n的$l",
	"$N单腿直立，双臂平伸，一式「雄鹰展翅」，双爪一前一后拢向$n的$l",
	"$N一式「拔翅横飞」，全身向斜里平飞，右腿一绷，双爪搭向$n的肩头",
	"$N双爪交错上举，使一式「迎风振翼」，一拔身，分别袭向$n左右腋空门",
	"$N全身滚动上前，一式「飞龙献爪」，右爪突出，鬼魅般抓向$n的胸口",
	"$N伏地滑行，一式「拨云瞻日」，上手袭向膻中大穴，下手反抓$n的裆部",
	"$N左右手掌爪互逆，一式「搏击长空」，无数道劲气破空而出，迅疾无比地击向$n",
	"$N腾空高飞三丈，一式「鹰扬万里」，天空中顿时显出一个巨灵爪影，缓缓罩向$n"
	];
this.desc = "明教的拳脚功夫";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed", "parry"];
this.learn_condition = {
	max_mp: 2000,
	skill: { unarmed: 200 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: lv * 1 + 10,
				mz: parseInt(lv * 1.1) + 0,
			},
			parry: {
				zj: lv * 1 + 10,
				max_hp: parseInt(lv * 8100.0 / 1000),
			},
		}
	};
