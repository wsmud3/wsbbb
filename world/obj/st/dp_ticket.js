this.inherits(OBJ);
this.set({
    name: "门派装备兑换券",
    desc: "一张珍贵的门派装备兑换券，使用后可兑换任意门派的任意一件装备。",
    unit: "张",
    value: 5000000,
    combined: false,
    transable: false,
    no_drop: true,
    grade: 5,
});
this.otype = 2;

// 门派显示顺序
this.FACTION_ORDER = ['wudang', 'huashan', 'emei', 'shaolin', 'gaibang', 'xiaoyao', 'sunv', 'shashou'];

// 各门派可用装备槽位（路径中的槽位名）
this.FACTION_SLOTS = {
    wudang:    { weapon: 'sword',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    huashan:   { weapon: 'sword',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    emei:      { weapon: 'sword',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    shaolin:   { weapon: 'blade',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    gaibang:   { weapon: 'staff',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    xiaoyao:   { weapon: 'glove',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    sunv:      { weapon: 'sword',  cloth: 'cloth', shoes: 'shoes', head: 'head', wrist: 'wrist', waist: 'waist' },
    shashou:   { weapon: 'ss_throw' },
};

// 槽位显示顺序
this.SLOT_ORDER = ['weapon', 'cloth', 'shoes', 'head', 'wrist', 'waist'];

// 门派中文名
this.FACTION_NAMES = {
    wudang: '武当', huashan: '华山', emei: '峨眉', shaolin: '少林',
    gaibang: '丐帮', xiaoyao: '逍遥', sunv: '神女', shashou: '杀手',
};

// 装备槽位中文名
this.SLOT_NAMES = {
    sword: '武器', blade: '武器', staff: '武器', glove: '武器', ss_throw: '暗器',
    cloth: '衣服', shoes: '鞋', head: '头部', wrist: '护腕', waist: '腰带',
};

this.on_use = function (me, par) {
    if (!par) {
        // 步骤1：选择门派
        var cmds = [];
        for (var i = 0; i < this.FACTION_ORDER.length; i++) {
            var f = this.FACTION_ORDER[i];
            cmds.push("use " + this.id + " " + f);
            cmds.push(this.FACTION_NAMES[f] || f);
        }
        me.notify("请选择你要兑换的门派装备：");
        me.send_commands.apply(me, cmds);
        return false;
    }

    // 检查是否为 faction_slot 格式（如 wudang_sword）
    var usIdx = par.indexOf('_');
    if (usIdx > 0) {
        var faction = par.substring(0, usIdx);
        var slot = par.substring(usIdx + 1);
        var slots = this.FACTION_SLOTS[faction];
        if (!slots || !slots[slot]) {
            return me.notify("无效的选择。");
        }
        var fname = this.FACTION_NAMES[faction] || faction;
        var sname = this.SLOT_NAMES[slots[slot]] || slot;
        var eqPath = "eq/lv5/" + faction + "/" + slots[slot];

        // Check if this is a confirmation (par starts with '!')
        if (par[0] === '!') {
            // 步骤4：确认兑换
            par = par.substring(1);
            var usIdx2 = par.indexOf('_');
            faction = par.substring(0, usIdx2);
            slot = par.substring(usIdx2 + 1);
            slots = this.FACTION_SLOTS[faction];
            eqPath = "eq/lv5/" + faction + "/" + slots[slot];
            var obj = me.add_obj(eqPath, 1);
            if (obj) {
                fname = this.FACTION_NAMES[faction] || faction;
                sname = this.SLOT_NAMES[slots[slot]] || slot;
                me.notify("你使用" + this.color_name + "兑换了" + fname + sname + "「" + obj.color_name + "」。");
            } else {
                me.notify("兑换失败，请重试。");
                return false;
            }
            return;
        }

        // 步骤3：预览装备属性，询问是否确认
        var preview = OBJ.CREATE(eqPath);
        if (preview) {
            var desc = preview.get_desc ? preview.get_desc(me) : (preview.desc || '');
            var msg = ['<hig>', fname, sname, '：', preview.color_name, '</hig>\\n'];
            msg.push(desc, '\\n');
            msg.push('\\n<hiy>是否确认兑换此装备？</hiy>');
            var cmds = [];
            cmds.push("use " + this.id + " !" + faction + "_" + slot);
            cmds.push("确认兑换");
            cmds.push("use " + this.id + " " + faction);
            cmds.push("返回重选");
            me.notify(msg.join(''));
            me.send_commands.apply(me, cmds);
        } else {
            me.notify("该装备暂不可用，请选择其他部位。");
        }
        return false;
    }

    // 步骤2：选择了门派，显示该门派的装备槽位
    var faction = par;
    var slots = this.FACTION_SLOTS[faction];
    if (!slots) {
        return me.notify("无效的门派选择。");
    }
    var fname = this.FACTION_NAMES[faction] || faction;
    var cmds = [];
    for (var i = 0; i < this.SLOT_ORDER.length; i++) {
        var s = this.SLOT_ORDER[i];
        if (!slots[s]) continue; // 该门派无此槽位
        cmds.push("use " + this.id + " " + faction + "_" + s);
        cmds.push(this.SLOT_NAMES[slots[s]] || s);
    }
    me.notify("请选择你要兑换的" + fname + "装备部位：");
    me.send_commands.apply(me, cmds);
    return false;
};
