OBJ.prototype.format_to_sell = function (seller) {

    var name_display = this.color_name;
    if (seller) {
        name_display = "<span cmd='checkobj " + this.id + " from " + seller + "'>" + this.color_name + "</span>";
    }
    return `["${name_display}","${this.id}",${this.count},${this.grade},"${this.unit}",${this.value}]`;
}


OBJ.prototype.format_to_pack = function () {

    var isCustom = this.is_custom || (this.words && this.words.length > 0) || (this.path === "eq/cp");
    return `["${this.color_name}","${this.id}",${this.count},${this.grade},"${this.unit}",${this.transable ? this.value : 0},${this.is_equipment ? 1 : 0},${this.on_use ? 1 : 0},${this.on_study ? 1 : 0},${this.on_open ? 1 : 0},${this.combine_count > 0 ? this.combine_count : 0},${this.is_locked ? 1 : 0},${this.otype},${isCustom ? 1 : 0}]`;
}
