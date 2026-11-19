this.inherits(SKILL);
this.name = "《论语》";
this.id = "lunyu";
this.is_hidden = true; // 由朱熹传授（读书写字 3000 级以上），不进随机残页池
this.grade = 2;
this.can_enables = ["literate"];
this.query_enable_prop = function (lv) {return {literate: {int: parseInt(lv/5),lianxi_per: parseInt(lv/6),study_per: parseInt(lv/6),},}};
