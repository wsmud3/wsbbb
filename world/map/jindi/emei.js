this.inherits(ROOM);
this.name = "白梅庵";
this.desc = "云雾缭绕中一座小小的禅庵，庵前种着几株白梅。峨眉祖师在庵中清修，木鱼声笃笃不绝，梵音若有若无，听得人心头一片清明。庵后石阶隐没在翻涌的云海之中，尽头偶有佛光一闪——那是金顶佛光。";
this.exits = { "east": "jindi/em_lu" };
this.no_fight = true;

// 本门禁地入口：只接纳本门弟子（WORLD.ZHENYI.enter_from_hub 内校验）。
this.add_action("enter_jd", "踏入金顶佛光", function (me) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.enter_from_hub(me, "jdfg") : false;
});
