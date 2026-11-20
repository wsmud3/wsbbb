this.inherits(ROOM);
this.name = "山心石坪";
this.desc = "云湺山深处的一片青石坪，四下古木苍苍，白云自脚边缓缓流过，伸手可掬。坪心立着一块无字古碑，碑身斑驳，不知历经了多少风雨。石坪西去是一条积雪的小径，东去是一片竹林，北面古道两旁松柏森森，西北一条樵径隐隐传来剑鸣，东北一座石台高出云海。各大门派的祖师避世隐居于此，潜心武学，数十年不问江湖之事。";
this.exits = {"south": "jindi/songfeng", "west": "jindi/sn_lu", "east": "jindi/wd_lu", "north": "jindi/sl_lu", "northwest": "jindi/hs_lu", "northeast": "jindi/guanyun"};
this.no_fight = true;

this.add_action("look_stele", "细看古碑", function (me) {
    me.notify("你走近古碑。碑上并无一字，指尖抚过，却觉每一道风蚀的痕迹里都藏着一缕武意——刚猛的、绵柔的、凌厉的、圆融的，各不相同。\n恍惚间你明白过来：山中八处居所，各住着一派隐世的祖师；由他们的居所，才寻得到本门先贤封存武意的禁地。");
});
