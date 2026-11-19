"use strict";
// 回归测试（真实引擎）：NPC 攻击/防御/命中/闪避/招架会吃增益和减益。
// 模板设定的数值作为基础值保留；被副本脚本直接改写的数值成为新的基础值；真意叠层不被冲掉。
// 运行：node tools/test_npc_recount.js
const assert = require("assert");

function mkNpc(stats) {
    const n = new NPC();
    n.prop = {}; n.status = []; n.temp = {};
    n.str = n.con = n.dex = n.int = 20;
    Object.assign(n, stats);
    n.send_room = function () {}; n.notify = function () {}; n.notify_hp = function () {};
    n.recount();
    return n;
}

require("./zhenyi_sim/boot.js")().then(() => {
    // 模板 NPC：基础值保留，减益生效，结束后恢复
    const n = mkNpc({ gj: 100000, fy: 50000, mz: 80000, ds: 60000, zj: 40000 });
    assert.strictEqual(n.gj, 100000, "模板攻击保留");
    n.add_status({ id: "t_debuff", name: "测试减益", duration: 10000, downside: true,
        prop: { gj_per: -30, ds_per: -30, fy: -10000, zj_per: 50 } });
    assert.strictEqual(n.gj, 70000, "攻击 -30%");
    assert.strictEqual(n.ds, 42000, "闪避 -30%");
    assert.strictEqual(n.fy, 40000, "防御 -10000");
    assert.strictEqual(n.zj, 60000, "招架 +50%（NPC 自身增益）");
    n.recount(); n.recount();
    assert.strictEqual(n.gj, 70000, "多次重算不叠加");
    n.remove_status("t_debuff", true);
    assert.deepStrictEqual([n.gj, n.fy, n.mz, n.ds, n.zj], [100000, 50000, 80000, 60000, 40000], "减益结束后恢复模板值");

    // 副本脚本直接改写数值：成为新的基础值，之后的减益在新值上计算
    n.gj = 160000; n.recount();
    assert.strictEqual(n.gj, 160000, "脚本改写保留");
    n.add_status({ id: "t2", name: "测试", duration: 10000, downside: true, prop: { gj_per: -50 } });
    assert.strictEqual(n.gj, 80000, "在新基础值上减 50%");
    n.remove_status("t2", true);
    assert.strictEqual(n.gj, 160000);

    // 公式 NPC（未设定五项）：每次按公式重算，减益生效
    const m = mkNpc({}); m.add_prop("gj", 10000); m.recount();
    const g0 = m.gj;
    assert.ok(g0 > 0, "公式攻击 > 0");
    m.add_status({ id: "t3", name: "测试", duration: 10000, downside: true, prop: { gj_per: -50 } });
    assert.ok(m.gj < g0, "公式 NPC 吃减益");
    m.remove_status("t3", true);
    assert.strictEqual(m.gj, g0, "公式 NPC 恢复");

    // 真意叠层（直接改数值）在重算后保留，且不被当成新的基础值反复叠加
    const z = mkNpc({ gj: 100000, fy: 50000, mz: 80000, ds: 60000, zj: 40000 });
    z._apply_zc_stack("t_zc", "ds", -0.1, 5);
    const dsStacked = z.ds;
    assert.strictEqual(dsStacked, 54000, "叠层 -10% 闪避");
    z.recount(); z.recount();
    assert.strictEqual(z.ds, 54000, "重算后叠层保留且不重复");

    // 外部改写时扣掉当时的状态加成再存为基础值（如副本脚本按当前攻击改写）
    const w = mkNpc({ gj: 100000, fy: 50000, mz: 80000, ds: 60000, zj: 40000 });
    w.add_status({ id: "w_deb", name: "测试", duration: 10000, downside: true, prop: { gj_per: -50 } });
    assert.strictEqual(w.gj, 50000);
    w.gj = 60000; w.recount();               // 脚本在减益期间改写：视为「受减益影响后的 60000」
    assert.strictEqual(w.gj, 60000, "改写值保留");
    w.remove_status("w_deb", true);
    assert.strictEqual(w.gj, 120000, "减益结束后按扣除减益的新基础值恢复，不固化减益");

    // 「先改字段再改回」期间发生 recount：用 with_temp_prop 不会固化
    const t = mkNpc({ gj: 100000, fy: 50000, mz: 80000, ds: 60000, zj: 40000 });
    t.add_status({ id: "t_buf", name: "测试", duration: 10000, prop: { gj_per: 50 } });
    t.with_temp_prop("x", { gj_per: -30 }, function () {
        assert.strictEqual(t.gj, 120000, "临时 -30%");
        t.add_status({ id: "t_mid", name: "测试", duration: 10000, prop: { mz: 1 } });
    });
    t.remove_status("t_buf", true); t.remove_status("t_mid", true);
    assert.strictEqual(t.gj, 100000, "临时属性与增益结束后回到模板值");

    // 原型上已有记录对象（模板 on_create 里 recount 过）时，克隆实例各用各的
    const proto = mkNpc({ gj: 200000, fy: 1, mz: 1, ds: 1, zj: 1 });
    const A = Object.create(proto), B = Object.create(proto);
    A.status = []; B.status = []; A.prop = {}; B.prop = {}; A.buff_prop = {}; B.buff_prop = {};
    A.recount(); B.recount();
    A.add_status({ id: "a_deb", name: "测试", duration: 10000, downside: true, prop: { gj_per: -50 } });
    B.recount();
    A.remove_status("a_deb", true);
    assert.strictEqual(A.gj, 200000, "实例间不共享基础值");
    assert.strictEqual(B.gj, 200000);

    console.log("test_npc_recount: all passed");
    process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
