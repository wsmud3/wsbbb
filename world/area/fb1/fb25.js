this.inherits(AREA);
this.set({
    id: "hmy",
    name: "黑木崖",
    desc: "黑木崖高耸入云，易守难攻，日月神教总舵所在。教众遍布四处关卡，教主东方不败武功盖世，葵花宝典威震江湖。",
    score: 240,
    is_show: true,
    first: "hmy/shangu",
    is_copy: true,
    expend: 10,
    is_multi: true,
    exp: 34000,
    pot: 30000,
    room_path: "hmy/",
    ss_title: "日月教主"
});
		this.map = [
	    { n: "山谷", id: "hmy/shangu", p: [0, 0], exits: ["n","e","s"] },
	    { n: "白虎堂", id: "hmy/bh_tang", p: [0, -1], exits: ["s","n"] },
	    { n: "走廊", id: "hmy/bh_lang", p: [0, -2], exits: ["s","n"] },
	    { n: "大厅", id: "hmy/bh_ting", p: [0, -3], exits: ["s"] },
	    { n: "青龙堂", id: "hmy/ql_tang", p: [0, 1], exits: ["s","n"] },
	    { n: "走廊", id: "hmy/ql_lang", p: [0, 2], exits: ["s","n"] },
	    { n: "大厅", id: "hmy/ql_ting", p: [0, 3], exits: ["n"] },
	    { n: "密林", id: "hmy/shulin", p: [1, 0], exits: ["n","e","w","s"] },
	    { n: "风雷堂", id: "hmy/fl_tang", p: [1, -1], exits: ["n","s"] },
	    { n: "走廊", id: "hmy/fl_lang", p: [1, -2], exits: ["n","s"] },
	    { n: "大厅", id: "hmy/fl_ting", p: [1, -3], exits: ["s"] },
	    { n: "天香堂", id: "hmy/tx_tang", p: [1, 1], exits: ["n"] },
	    { n: "悬崖", id: "hmy/up1", p: [2, 0], exits: ["w"] },
	    { n: "悬崖", id: "hmy/up2", p: [2, -1], exits: ["w"] },
	    { n: "悬崖", id: "hmy/up3", p: [2, -2], exits: ["s"] },
	    { n: "大门", id: "hmy/damen", p: [3, -2], exits: ["w","e"] },
	    { n: "承德殿", id: "hmy/chengdedian", p: [4, -2], exits: ["w","e"] },
	    { n: "后厅", id: "hmy/houdian", p: [5, -2], exits: ["w","n"] },
	    { n: "密道", id: "hmy/midao1", p: [5, -1], exits: ["s"] },
	    { n: "小花园", id: "hmy/huayuan", p: [5, 0], exits: ["w","e"] },
	    { n: "闺房", id: "hmy/guifang", p: [6, 0], exits: ["w"] },
		];
// 闺房令牌检查（同时检查temp标记和背包中的令牌物品）
this.check_tokens = function(me) {
    function _hasToken(me, tokenName) {
        // 方式1: temp标记
        if (me.query_temp(tokenName)) return true;
        // 方式2: 背包中搜索令牌物品
        if (me.items) {
            for (var i = 0; i < me.items.length; i++) {
                var it = me.items[i];
                if (it && it.name && it.name.indexOf('令') >= 0) {
                    // 检查令牌名称匹配：白虎令/青龙令/风雷令
                    if (tokenName === 'hmy_baihu_token' && it.name === '白虎令') return true;
                    if (tokenName === 'hmy_qinglong_token' && it.name === '青龙令') return true;
                    if (tokenName === 'hmy_fenglei_token' && it.name === '风雷令') return true;
                }
            }
        }
        return false;
    }
    return _hasToken(me, 'hmy_baihu_token') &&
           _hasToken(me, 'hmy_qinglong_token') &&
           _hasToken(me, 'hmy_fenglei_token');
};
this.drops = [
    "book/bc#kuihuashengong",
    "book/bc#pixiejianfa",
    "eq/lv3/shangguanyun_pifeng",
    "eq/lv3/tongbaixiong_jiezhi",
    "eq/lv3/yanglianting_xiangquan",
    "eq/lv3/jiabu_huyaosuo",
    "eq/lv4/xiuhuazhen"
];

	this.quick_drops = [
	    { obj: "money/silver", min: 1, max: 10 },
	    { obj: ["eq/lv3/shangguanyun_pifeng", "eq/lv3/tongbaixiong_jiezhi", "eq/lv3/yanglianting_xiangquan", "eq/lv3/jiabu_huyaosuo"], odds: 250 },
	    { obj: "eq/lv4/xiuhuazhen", odds: 90 },
	    { obj: ["book/bc#kuihuashengong", "book/bc#pixiejianfa"], odds: 2900 },
	];
