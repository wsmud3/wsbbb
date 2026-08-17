this.inherits(SKILL);
this.name = "绝门棍";
this.id = "juemengun";
this.grade = 1;
this.dodge_actions = [
    "$n右脚轻轻一点跃开躲过了$N的攻击。",
    "$n向旁边扑出，顺势一滚，闪到一边。",
    "$n斜里冲前一步，身法诡异，$N这一招落到空处。",
    "$n忽然直身飞入半空，很久也不见人影，半响后竟闪到了$N的背后。",
    "$n突然一个急转身，$N的这一招滑到了一边。",
];
this.attack_actions = [
    "$N斜里冲前一步，身法诡异，手中$w横扫$n的$l",
    "$N忽然直身飞入半空，很久也不见人影，$n正搜寻间，$N已飞身扑下，$w攻向$n的$l",
    "$N原地一个后滚翻，却在落地的一刹那，身体向$n平飞过去，手中$w指向$n的$l",
    "$N突然一个急转身，$w横扫一圈后挟着猛烈的劲道打向$n的$l",
    "$N向前扑出，顺势一滚，接着翻身跳起，手里$w斜向上击向$n的$l",
    "$N手中$w上下翻飞，舞成了一团杖花，这杖花绕$n游走三圈后指向$n的$l"

];
this.desc = "据说曾经是少林七十二绝技中的一种棍法，流传至今不知还有几分精髓，可以装备为棍法和轻功";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["club", "dodge"];

this.query_enable_prop = function (lv) {
    return {
            dodge: {
                ds: lv * 1 + 5,
            },
            club: {
                gj: lv * 1 + 5,
            },
        }
    }

this.pfm = {
    pfm1: {
            name: "绝棍闷打",
            distime: 10000,
            enable_skill: "club",
            release_time: 3096,
            mp: 15,
            use: function (me, target, lv) {
                me.send_room("<HIY>$N手中$w毫无章法地一阵乱打——「绝棍闷打」！看似混乱无章，实则招招阴狠，棍影重重，$n眼花缭乱，根本无从判断棍从何来！</HIY>", target);
                me.do_attack({
                    target: target,
                    gj: Math.floor(me.gj * 320 / 100),
                    mz: me.mz + 20,
                });
                me.end_attack(target)
            },
            query_desc: function (me, lv) {
                return "快速混乱的闷棍，看似无章法，却使敌人难以躲闪，增加自身命中20，造成320%攻击力的伤害。";
            }
        }
    };
