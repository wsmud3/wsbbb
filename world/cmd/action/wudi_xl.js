/**
 * 武帝修炼 - 五气朝元系统
 * 在五岳之巅的修炼入口，处理召唤试炼之影和吸收聚元珠
 */

this.inherits(COMMAND);
this.command = "wudi_xl";

// 五处灵气位置定义
const LOCATIONS = {
    huashan: {
        index: 0,
        name: "华山绝顶",
        element: "金行灵气",
        base_skill: "weapon",  // 任意武器技能
        desc: "金光璀璨，锋锐无匹"
    },
    taishan: {
        index: 1,
        name: "泰山玉皇顶",
        element: "土行灵气",
        base_skill: "force",
        desc: "黄土厚重，承载万物"
    },
    hengshan_n: {
        index: 2,
        name: "恒山见性峰",
        element: "木行灵气",
        base_skill: "parry",
        desc: "青木葱茏，生生不息"
    },
    hengshan_s: {
        index: 3,
        name: "衡山祝融殿",
        element: "火行灵气",
        base_skill: "unarmed",
        desc: "烈焰熊熊，焚尽虚空"
    },
    songshan: {
        index: 4,
        name: "嵩山封禅台",
        element: "水行灵气",
        base_skill: "dodge",
        desc: "玄水幽深，柔韧不绝"
    }
};

// 检查技能条件
function check_skill_condition(me, loc) {
    var base_skill = loc.base_skill;
    var sk = me.skills;

    if (base_skill === "weapon") {
        // 任意武器技能 + 对应的橙色特殊技能
        var weapon_types = ["sword", "blade", "club", "whip", "staff"];
        for (var i = 0; i < weapon_types.length; i++) {
            var wt = weapon_types[i];
            if (sk[wt] && sk[wt].level >= 2500 && sk[wt].enable_skill) {
                var sp_skill = SKILL.get(sk[wt].enable_skill);
                if (sp_skill && sp_skill.grade >= 5) {
                    return true;
                }
            }
        }
        return false;
    }

    // 特定基本技能 + 对应的橙色特殊技能
    if (!sk[base_skill] || sk[base_skill].level < 2500) {
        me.notify("[DEBUG] base_skill=" + base_skill + " sk_exists=" + !!sk[base_skill] + " level=" + (sk[base_skill] ? sk[base_skill].level : "N/A"));
        return false;
    }
    if (!sk[base_skill].enable_skill) {
        me.notify("[DEBUG] enable_skill is falsy: " + sk[base_skill].enable_skill);
        return false;
    }

    var sp_skill = SKILL.get(sk[base_skill].enable_skill);
    if (!sp_skill || sp_skill.grade < 5) {
        me.notify("[DEBUG] enable_skill_id=" + sk[base_skill].enable_skill + " sp_skill=" + !!sp_skill + " grade=" + (sp_skill ? sp_skill.grade : "N/A"));
        return false;
    }

    return true;
}

// 检查该位置是否已有活着的影子
function has_shadow(me) {
    var env = me.environment;
    if (!env || !env.items) return false;
    for (var i = 0; i < env.items.length; i++) {
        if (env.items[i].is_wudi_shadow && env.items[i].hp > 0) {
            return env.items[i];
        }
    }
    return null;
}

// 在指定房间中查找NPC
function find_npc(room_path, npc_name) {
    var room = ROOM.Get(room_path);
    if (!room || !room.items) return null;
    for (var i = 0; i < room.items.length; i++) {
        var item = room.items[i];
        if (item && !item.is_player && item.name === npc_name) {
            return item;
        }
    }
    return null;
}

// 吸收聚元珠
function start_absorb(me, loc) {
    // 检查当前内力
    if (me.mp < 1500000) {
        return me.notify("你当前内力不足150万，无法吸收" + loc.element + "。请先打坐恢复内力。");
    }

    // 检查技能条件
    if (!check_skill_condition(me, loc)) {
        var sk_names = {force: "内功", parry: "招架", unarmed: "拳脚", dodge: "轻功"};
        var requirement = loc.base_skill === "weapon" ? "任意武器技能及对应的橙色特殊技能达到2500级" :
            "基本" + sk_names[loc.base_skill] + "及对应的橙色特殊技能达到2500级";
        return me.notify("你的" + requirement + "，无法吸收" + loc.element + "。");
    }

    // 检查背包里是否有聚元珠
    if (!me.find_obj_bypath("sp/juyuanzhu")) {
        return me.notify("你的背包中没有聚元珠，无法吸收灵气。");
    }

    // 开始吸收（设置吸收状态）
    if (me.query_temp("wd_absorbing")) {
        return me.notify("你正在吸收灵气中……");
    }

    me.set_temp("wd_absorbing", 1);

    // 添加动作状态：防止移动或其他行动打断吸收（持续10秒，稍长于回调作为安全余量）
    me.add_status({
        id: "wd_absorb",
        name: "<hiy>吸收灵气</hiy>",
        is_busy: true,
        is_rash: true,
        duration: 11000,
        no_diff: true,
        desc: "正在盘膝吸收五行灵气，无法行动"
    });

    me.send_room("$N盘膝坐下，双手捧起聚元珠，开始吸收" + loc.element + "。\n<hiy>" + loc.desc + "，将$N笼罩在氤氲灵气之中……</hiy>");

    me.notify("<hiy>你开始吸收" + loc.element + "，聚元珠在你掌心缓缓旋转，五彩光华流转……</hiy>");

    // 吸收过程：10秒后完成
    me.call_out(function () {
        if (!me.query_temp("wd_absorbing")) {
            me.remove_status("wd_absorb");
            return; // 被打断了
        }

        // 先清除吸收动作状态
        me.remove_status("wd_absorb");

        // 消耗当前内力
        me.mp -= 1500000;
        if (me.mp < 0) me.mp = 0;

        // 重新查找并移除聚元珠（不用闭包引用，避免引用失效）
        var zhu = me.find_obj_bypath("sp/juyuanzhu");
        if (zhu) me.remove_obj(zhu, 1);

        // 记录吸收
        var absorbed = me.query_temp("wd_absorbed", 0);
        absorbed |= (1 << loc.index);
        me.set_temp("wd_absorbed", absorbed);

        // 奖励
        me.limit_mp += 300000;
        me.add_temp("fenpei", 1);
        // 奖励追踪（防呆补发用）
        var rwdMask = me.query_temp("wd_rwd", 0);
        rwdMask |= (1 << loc.index);
        me.set_temp("wd_rwd", rwdMask);

        // 检查是否第一次吸收，给予元神buff
        if (!me.query_temp("wd_yuanshen")) {
            me.set_temp("wd_yuanshen", 1);
            me.add_status({
                id: "yuanshen",
                name: "<hig>元神</hig>",
                override: 2,
                desc: "五气朝元凝聚的元神，打坐效率提升1000%",
                duration: 10800000,  // 持续3小时
                prop: {
                    dazuo_per: 1000,
                }
            });
            me.notify("<hiy>你成功吸收了" + loc.element + "，五气初凝，元神显现！</hiy>");
            me.notify("<hig>你获得了「元神」——打坐效率提升1000%！</hig>");
        } else {
            me.notify("<hiy>你成功吸收了" + loc.element + "！</hiy>");
        }

        me.notify("<hiw>你的最大内力上限增加了300000。</hiw>");
        me.notify("<hiw>你获得了1点可分配先天属性。</hiw>");

        me.remove_temp("wd_absorbing");

        // 检查是否已吸收全部五个
        if (absorbed === 0x1F) {
            // 五气朝元完成，自动进阶武帝
            me.notify("<hiz>五行灵气齐聚于身，五气朝元，帝君降世！</hiz>");

            // 金古易和守门人同时发来贺讯
            var zhu = find_npc("yz/guangchang", "金古易");
            if (zhu) {
                zhu.do_command("chat", "<hiy>哈哈哈，五气朝元，帝君降世！天地间灵气翻涌激荡，五色祥云汇聚于空——恭迎" + me.name + "踏入武帝之境！</hiy>");
            }
            var men = find_npc("wudao/men", "守门人");
            if (men) {
                men.do_command("chat", "<hiy>守门人负手立于武道塔前，遥望天际，微微颔首：五气归元，帝君已成——" + me.name + "，你终于走到了这一步。</hiy>");
            }

            me.level_up();
        }

        me.send_room("$N长舒一口气，周身灵气渐渐内敛，显然功力又有精进。");
    }, 10000);
}

// 主入口
this.enter = function (me, location_key) {
    var loc = LOCATIONS[location_key];
    if (!loc) return me.notify("修炼地点配置错误，请联系管理员。");

    // 前置检查：必须是武圣境界且已接任务
    if (me.level < 4) {
        return me.notify("你的修为尚浅，还无法感应到此处的灵气。");
    }
    if (!me.query_temp("wd_quest")) {
        return me.notify("这里灵气充沛，但你还不懂得如何利用。");
    }

    // 已经是武帝了，不需要再修炼
    if (me.level >= 5) {
        return me.notify("你已是武帝之尊，这里的灵气对你已无太大帮助。");
    }

    // 检查是否已在此处吸收过
    var absorbed = me.query_temp("wd_absorbed", 0);
    if (absorbed & (1 << loc.index)) {
        return me.notify("你在此处的灵气已经吸收完毕，再去别处看看吧。");
    }

    // 检查是否已击败此处的影子
    var defeated = me.query_temp("wd_defeated", 0);
    if (!(defeated & (1 << loc.index))) {
        // 还没击败影子，需要先召唤
        var shadow = has_shadow(me);
        if (shadow) {
            return me.notify("试炼之影仍在眼前，先击败它再说吧！");
        }

        // 召唤影子
        shadow = NPC.CLONE("pub/wudi_shadow");
        if (!shadow) {
            return me.notify("灵气紊乱，无法凝聚试炼之影，请稍后再试。");
        }

        shadow.init_shadow(me);
        shadow.is_wudi_shadow = true;

        // 通过item_changed正确添加NPC到房间（发送itemadd给客户端）
        me.environment.item_changed(shadow, true,
            "<red>$N双手结印，五行灵气凝聚，一道与$N一模一样却笼罩血雾的身影凭空出现！</red>");

        me.notify("<red>灵气凝聚成了一道与你一模一样的身影——试炼之影！击败它才能获得聚元珠。</red>");

        // 存储当前位置的key，供影子死亡时使用
        me.set_temp("wd_current_location", location_key);

        // 自动开始战斗
        me.do_command("kill", shadow.id);
        return;
    }

    // 已击败影子，检查是否有聚元珠进行吸收
    start_absorb(me, loc);
};

// 标记影子已被击败（由影子NPC的on_die调用）
this.mark_defeated = function (me, location_key) {
    var loc = LOCATIONS[location_key];
    if (!loc) return;
    var defeated = me.query_temp("wd_defeated", 0);
    defeated |= (1 << loc.index);
    me.set_temp("wd_defeated", defeated);
};