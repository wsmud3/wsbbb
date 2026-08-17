this.inherits(ROOM);
this.name = "山洞";
this.desc = "一个隐秘的石洞，洞内幽暗深邃，石壁上刻着奇异的文字和图案。这里曾是周伯通的居所，洞中尚有一些生活痕迹。洞外涛声隐约传来。";
this.exits = { "west": "th/houshan" };
this.set_npc(["th/zhoubotong", 1]);
