EQUIPMENT.prototype.query_score = function () {
    if (this.grade != null) {
        var sc = this.score;
        if (!sc) sc = Math.max(this.grade * 100, 1);
        sc += this.level * Math.max(this.grade, 1) * 10;
        if (this.st_prop) {
            for (var i = 0; i < this.st_prop.length; i++) {
                sc += this.st_prop[i].grade * 10;
            }
        }
        return sc;
    }
    return 0;
}

