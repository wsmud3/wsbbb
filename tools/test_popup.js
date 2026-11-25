"use strict";
// 浮窗统一接口 me.popup 回归测试：消息格式、转义、富内容行、返回按钮、随从代办时弹给主人。
// 运行：node tools/test_popup.js
const assert = require("assert");
let failed = 0, passed = 0;
function check(name, fn) {
    try { fn(); passed++; }
    catch (e) { failed++; console.error("✗ " + name + "\n   " + ((e && e.stack) || e).split("\n").slice(0, 4).join("\n   ")); }
}
// 浮窗消息是宽松 JSON（键不带引号），客户端按 JSON5 解析，这里也一样
const JSON5 = require("json5");
function mkUser(sent) {
    const me = new USER(); me.id = "p" + Math.random().toString(36).slice(2, 8); me.name = "测试";
    me.send = t => sent.push(t);
    return me;
}

async function main() {
    check("按钮、说明、尺寸、常驻、提示行", () => {
        const sent = [], me = mkUser(sent);
        me.popup({ text: "选一个", buttons: [["cmd a", "甲"], { cmd: "cmd b", name: "乙" }], size: "lg", persistent: true, feedback: "提示" });
        const m = JSON5.parse(sent[0]);
        assert.strictEqual(m.type, "cmds");
        assert.deepStrictEqual(m.items, [{ cmd: "cmd a", name: "甲" }, { cmd: "cmd b", name: "乙" }]);
        assert.ok(m.text === "选一个" && m.size === "lg" && m.persistent === true && m.feedback === "提示");
        assert.ok(!("html" in m), "没有富内容就不带 html");
    });
    check("命令和名字里有引号、反斜杠、换行也能正确解析", () => {
        const sent = [], me = mkUser(sent);
        me.popup({ text: '他说"走"\n下一行', buttons: [['say "hi"', "名\\字"]] });
        const m = JSON5.parse(sent[0]);
        assert.strictEqual(m.items[0].cmd, 'say "hi"');
        assert.strictEqual(m.items[0].name, "名\\字");
        assert.strictEqual(m.text, '他说"走"\n下一行');
    });
    check("富内容行与返回按钮", () => {
        const sent = [], me = mkUser(sent);
        me.popup({ html: "<b>头</b>", rows: ["纯文字", { text: "带按钮", buttons: [["go 1", "去"]] }], back: "menu" });
        const m = JSON5.parse(sent[0]);
        assert.deepStrictEqual(m.items, []);
        assert.ok(m.html.indexOf("<b>头</b>") === 0, "html 在最前");
        assert.ok(m.html.indexOf('<div class="zc-row">纯文字</div>') > 0);
        assert.ok(m.html.indexOf("带按钮") > 0 && m.html.indexOf('cmd="go 1"') > 0);
        assert.ok(m.html.indexOf('cmd="menu"') > 0 && m.html.indexOf(">返回</span>") > 0, "默认返回按钮");
        sent.length = 0;
        me.popup({ back: ["menu 2", "上一页"] });
        assert.ok(JSON5.parse(sent[0]).html.indexOf(">上一页</span>") > 0);
    });
    check("随从被 dc 代办时浮窗弹给主人；没人指挥时不发", () => {
        const sent = [], owner = mkUser(sent);
        const f = new FOLLOWER(); f.name = "随从";
        f.popup({ buttons: [["dc x lianyao", "炼"]] });
        assert.strictEqual(sent.length, 0);
        f.listener = owner;
        f.popup({ buttons: [["dc x lianyao", "炼"]] });
        assert.strictEqual(JSON5.parse(sent[0]).items[0].cmd, "dc x lianyao");
    });
    console.log((failed ? "浮窗测试失败 " : "浮窗测试通过 ") + passed + "/" + (passed + failed));
    process.exit(failed ? 1 : 0);
}
require("./zhenyi_sim/boot.js")().then(main).catch(e => { console.error(e); process.exit(1); });
