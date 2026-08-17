this.inherits(ROOM);
this.name = "花园";
this.desc = "青城派的后花园清幽雅致，是按照道家天人合一的理念修建的。园中种满了青松、翠竹和寒梅，松竹梅岁寒三友齐聚于此。一方小池塘中养着几尾锦鲤，悠然自得。池边的石桌上刻着一个棋盘，似乎刚刚有人在此对弈。凉风习习，花香阵阵，令人心旷神怡。北面是上清殿，南面通向卧室。";
this.exits = { "north": "qc/shangqingdian", "south": "qc/woshi" };
this.set_npc(["qc/neimen", 1]);
