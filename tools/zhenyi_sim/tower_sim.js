"use strict";
// 武道塔对打模拟：真实引擎 + 虚拟时钟，玩家面板为「开 buff 后」，在普通房间（扬州广场）打指定层守护者。
// 用法（项目根目录）：
//   SIMLIB=tools/zhenyi_sim/tower_sim.js LV=2800 RUNS=3 NAME=近武帝 \
//     PANEL="gj=140000,mz=140000,zj=30000,ds=30000,fy=30000,hp=5000000,gjsd=500" FLOORS=90,95,99,100 \
//     node tools/zhenyi_sim/sim.js
// FLOORS 里 100 = 第一百层，101~105 = 上 1~5 层。玩家构造与 PANEL 规则见 sim.js 的 makePlayer。
module.exports = function () {
    const S = global.__sim; S.installClock();
    const RUNS = parseInt(process.env.RUNS || 3), floors = process.env.FLOORS.split(",").map(Number);
    const room = ROOM.Get("yz/guangchang");
    for (const f of floors) {
        let win = 0, secs = 0, left = 0, minHp = 0;
        for (let r = 0; r < RUNS; r++) {
            const me = S.makePlayer(r); WORLD.USERS.push(me);
            const npc = f >= 100 ? NPC.CLONE("pub/wudao_boss100") : NPC.CLONE("pub/wudao");
            if (f >= 100) npc.init_from(me, f - 100 || undefined); else npc.init_from(me, f);
            npc.no_fight = false; me.moveto(room); room.item_changed(npc, true); npc.environment = room;
            const t0 = S.T; let mh = me.hp; npc.do_kill(me);
            S.runUntil(() => { mh = Math.min(mh, me.hp); return me.hp <= 0 || npc.hp <= 0 || !npc.fight_type; }, 600000);
            if (npc.hp <= 0) win++; secs += (S.T - t0) / 1000; left += 100 * Math.max(0, npc.hp) / npc.max_hp; minHp += 100 * Math.max(0, mh) / me.max_hp;
            try { me.end_fight(); npc.end_fight(); room.item_changed(npc, false); } catch (e) {}
            WORLD.USERS.splice(WORLD.USERS.indexOf(me), 1); S.runUntil(() => false, 20000);
        }
        console.log((process.env.NAME || "").padEnd(5), "第" + String(f).padStart(3) + "层", "胜" + win + "/" + RUNS, "平均" + Math.round(secs / RUNS) + "秒", "守护者剩血" + Math.round(left / RUNS) + "%", "自身最低血" + Math.round(minHp / RUNS) + "%");
    }
    process.exit(0);
};
