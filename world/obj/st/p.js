this.inherits(OBJ);
this.unit = "块";
this.name = "词条石";
this.desc = "一块蕴含属性力量的词条石头，可以镶嵌到自制装备上。";
this.value = 50000;
this.grade = 4;
this.otype = 2;
this.transable = true;
this.combine_count = 10;

this.on_create = function (path, par) {
    if (!par) return;
    var prop_key = par.startsWith('#') ? par.substring(1) : par;
    var duanzao = WORLD.COMMANDS && WORLD.COMMANDS.duanzao;
    var prop_info = duanzao ? duanzao.PROPS[prop_key] : null;
    if (!prop_info) {
        this.name = "词条石·" + prop_key;
        return;
    }
    var category_name = duanzao.category_names[prop_info.category] || "未知";
    this.name = category_name + "：" + prop_info.name;
    this.grade = 5;
    // Add value info to description
    var base_val = duanzao.WORD_BASE ? (duanzao.WORD_BASE[prop_key] || 100) : 100;
    var is_per = prop_key.endsWith('_per') || prop_key === 'ignore_fy' || prop_key === 'final_damage';
    var is_time = (prop_key === 'gjsd' || prop_key === 'distime' || prop_key === 'releasetime');
    var val_desc;
    if (is_time) {
        val_desc = '-' + (base_val / 1000).toFixed(2) + '秒';
    } else if (is_per) {
        val_desc = '+' + base_val + '%';
    } else {
        val_desc = '+' + base_val + '点';
    }
    this.desc = '【' + category_name + '】' + prop_info.name + '：' + val_desc + '，可镶嵌到自制装备上。' + prop_info.desc;
    this.prop_key = prop_key;
    this.prop_category = prop_info.category;
};
