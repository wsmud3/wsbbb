this.inherits(ROOM);
this.name = "论剑台";
this.desc = "这里是华山最高一座山峰，眼前是一方圆数十丈的平台，有一凸起约丈高的石台，岩石上刻着四个大字：【华山论剑】，再上还有一处更加陡峭的<span cmd='look bi'>绝壁</span>，一般人很难再上去了。";
this.exits = {
    "west": "hslj/west",
    "east": "hslj/east",
    "south": "hslj/south",
    "north": "hslj/north",
};
this.set_npc(["hslj/dongxie", 1], ["hslj/nandi", 1], ["hslj/xidu", 1], ["hslj/beigai", 1], ["hslj/zhongshentong", 1]);
