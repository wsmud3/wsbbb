// 武道真意数据 - 各门派五种真意
// 存储: me.query_temp("zy_{key}_{id}")  e.g. me.set_temp("zy_jz_1", 1)
WORLD.ZHENYI = {
    HUASHAN: {
        name: "剑道真意", key: "jz",
        list: [
            { id: 1, name: "利剑·锋锐",   mech: "沉默", desc: "首击必中+沉默2s" },
            { id: 2, name: "软剑·无常",   mech: "缴械", desc: "缠兵：目标普攻-40%+反弹真伤" },
            { id: 3, name: "重剑·崩山",   mech: "内伤", desc: "暴击→附加内伤debuff" },
            { id: 4, name: "木剑·化生",   mech: "护盾", desc: "受致命伤→3s不死+伤害转护盾" },
            { id: 5, name: "无剑·破气",   mech: "反击", desc: "敌方技能后→领域反击" },
        ],
    },
    WUDANG: {
        name: "太极真意", key: "zw",
        list: [
            { id: 1, name: "借力", mech: "反击", desc: "连续招架2次→储存伤害+下次释放" },
            { id: 2, name: "化劲", mech: "内伤", desc: "被暴击→化解+反弹内伤debuff" },
            { id: 3, name: "粘劲", mech: "缠绕", desc: "格挡后→目标无法切换目标+减速" },
            { id: 4, name: "乱环", mech: "延迟", desc: "HP<40%→延迟30%伤害10s" },
            { id: 5, name: "无极", mech: "缴械", desc: "HP<15%→清负面+缴械1s" },
        ],
    },
    SHAOLIN: {
        name: "禅武真意", key: "dmd",
        list: [
            { id: 1, name: "金刚不坏", mech: "锁血", desc: "受致命伤→保留1HP+受击回血" },
            { id: 2, name: "狮吼功",   mech: "恐惧", desc: "10s受击3次→恐惧周围2s" },
            { id: 3, name: "般若心",   mech: "沉默", desc: "HP<50%→受击时沉默攻击者" },
            { id: 4, name: "罗汉阵",   mech: "护盾", desc: "被围攻→金钟罩吸收伤害" },
            { id: 5, name: "禅定",     mech: "免控", desc: "打坐30s→下次战斗15s免控" },
        ],
    },
    EMEI: {
        name: "佛光真意", key: "jdfg",
        list: [
            { id: 1, name: "慈航普度", mech: "治疗", desc: "治疗→佛光印记延迟爆炸治疗" },
            { id: 2, name: "金刚怒目", mech: "护盾", desc: "队友HP<30%→金刚罩+反伤" },
            { id: 3, name: "菩提心",   mech: "反弹", desc: "受控→自动解除并反弹" },
            { id: 4, name: "轮回",     mech: "复活", desc: "队友死亡→复活+20%HP" },
            { id: 5, name: "佛光普照", mech: "护盾", desc: "群疗过量→转化护盾" },
        ],
    },
    GAIBANG: {
        name: "降龙真意", key: "js",
        list: [
            { id: 1, name: "亢龙有悔", mech: "恐惧", desc: "3种掌法→恐惧+必中" },
            { id: 2, name: "飞龙在天", mech: "破甲", desc: "暴击→目标防御-30%" },
            { id: 3, name: "神龙摆尾", mech: "重置", desc: "击杀→重置轻功+回蓝" },
            { id: 4, name: "龙战于野", mech: "真伤", desc: "HP<40%→普攻附带真伤" },
            { id: 5, name: "时乘六龙", mech: "召唤", desc: "连中5次→龙形虚影协同" },
        ],
    },
    XIAOYAO: {
        name: "北冥真意", key: "lhfd",
        list: [
            { id: 1, name: "北冥鲸吞", mech: "吸蓝", desc: "击败→吸取内力为临时上限" },
            { id: 2, name: "凌波残影", mech: "分身", desc: "连闪2次→残影迷惑3s" },
            { id: 3, name: "白虹贯日", mech: "吸蓝", desc: "内力>80%→伤害转吸蓝" },
            { id: 4, name: "生死符",   mech: "冰冻", desc: "内力>90%→附加冰冻减速" },
            { id: 5, name: "逍遥御风", mech: "隐身", desc: "15s未受击→隐身+首击必暴" },
        ],
    },
    SHASHOU: {
        name: "暗杀真意", key: "xl",
        list: [
            { id: 1, name: "影遁",   mech: "沉默", desc: "脱战10s→首击沉默3s" },
            { id: 2, name: "暗步",   mech: "隐身", desc: "非战斗移速+20%+进战无法选中" },
            { id: 3, name: "刺穴",   mech: "定身", desc: "HP>80%目标→忽视30%防御+定身" },
            { id: 4, name: "血债",   mech: "真伤", desc: "击杀→下次攻击额外真伤" },
            { id: 5, name: "修罗道", mech: "领域", desc: "HP<20%→暗杀姿态8s" },
        ],
    },
    SUNV: {
        name: "九天真意", key: "yc",
        list: [
            { id: 1, name: "金行·锐", mech: "破甲", desc: "内力>80%→技能附带破甲" },
            { id: 2, name: "水行·润", mech: "护盾", desc: "过量治疗→转化护盾" },
            { id: 3, name: "火行·灼", mech: "真伤", desc: "连续同属3次→燃烧真伤" },
            { id: 4, name: "土行·固", mech: "石化", desc: "受击→减伤+印记→石化2s" },
            { id: 5, name: "木行·缚", mech: "缠绕", desc: "技能命中→缠绕3s" },
        ],
    },
};
