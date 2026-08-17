this.inherits(ROOM);
this.name = "软剑阁";
this.desc = "第二座剑冢。一柄紫薇软剑横放石台之上，剑身柔软如绸，在没有风的洞中却自行颤动不休，发出嗡嗡剑鸣。石台周围的地面上，九块青石砖排成三行三列，每块砖上分别刻着一个古篆——「总」「破」「气」「剑」「刀」「枪」「掌」「索」「箭」。软剑的每一次颤动，都会让其中一块石砖亮起微光，随即熄灭。";
this.exits = { "south": "jz/jianhen", "north": "jz/ruanjiantai" };
this.no_fight = true;

// 序列谜题
this.on_create = function () {
    var seq = [];
    var bricks = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (var i = 0; i < 5; i++) {
        var idx = Math.floor(Math.random() * bricks.length);
        seq.push(bricks[idx]);
        bricks.splice(idx, 1);
    }
    this._seq = seq;
    this._step = 0;
};

var brickNames = ["总诀式", "破剑式", "破气式", "破刀式", "破枪式", "破掌式", "破索式", "破箭式", "破鞭式"];

for (var i = 1; i <= 9; i++) {
    (function (n) {
        this.add_action("step_" + n, "踩踏【" + brickNames[n - 1] + "】石砖", function (me) {
            if (!this._seq) return me.notify("软剑停止了震动，似乎已经不再考验来者。");
            if (this._seq[this._step] === n) {
                this._step++;
                if (this._step >= 5) {
                    me.notify("<hig>软剑发出一声清越的剑鸣，停止了颤动。剑灵从剑身中缓缓脱出——你已经领悟了变化无常的剑意。</hig>");
                    this._seq = null;
                    this.exits = { "south": "jz/jianhen", "north": "jz/ruanjiantai" };
                } else {
                    me.notify("石砖泛起微光——第" + this._step + "步已踏下，还需" + (5 - this._step) + "步。软剑的震动似乎在引你继续……");
                }
            } else {
                this._step = 0;
                me.notify("<hir>软剑嗡鸣大作，一股剑意反噬而来！</hir>序列被打乱了，你必须从头开始。");
                me.damage2(me.max_hp * 0.1);
            }
        });
    }).call(this, i);
}
