	this.inherits(ROOM);
	this.name = "西房";
	this.desc = "一间阴暗的土屋，四壁挂满了风干的毒蛇、蟾蜍和蝙蝠。桌上摆放着各种研磨毒药的器具——石臼、铜钵、银刀，在烛光下闪着寒光。角落里一只黑猫正用碧绿的眼睛盯着你，让人脊背发凉。北面是南院，南面通向练毒室。";
	this.exits = { "north": "wudu/nanyuan", "south": "wudu/liandushi" };
	this.set_npc(["wudu/dulangzhong", 1]);
