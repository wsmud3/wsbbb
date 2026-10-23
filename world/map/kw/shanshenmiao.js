this.inherits(ROOM);
this.name = "山神庙";
this.desc = "这是一个用木板和石头垒成的小庙，庙前地上散落着一些然过的灰烬。庙里供奉着山神爷老把头的灵位 。传说他是所有采参人的祖师爷，所以每个进山挖参的参客都要来这里祭拜，希望能得到他老人家的保佑。";
this.exits = {
    "south": "kw/huangdi",
};
this.set_npc(["kw/yanji", 1]);
