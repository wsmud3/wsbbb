this.inherits(ROOM);
this.name = "会盟堂";
this.desc = "这里是五岳剑派中枢所在堂中放着一张黄稠太师椅，那是盟主的宝座。两边雁形排列这泰、华、衡、的青昵、白绸、红罗、黑绫座椅，椅后插着各派的五色旗。";
this.exits = {
    "north": "ss/jianchi",
    "south": "ss/zhongmen",
    "east": "ss/donglang",
    "west": "ss/xilang",
};
this.set_npc(["ss/zuolengchan", 1]);
