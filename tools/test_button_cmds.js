// 静态校验：按钮命令不能把「命令 + 参数」粘成一个词（如 duanzao ok 写成 duanzaook，服务器只会回「什么？」）。
// 扫描所有 send_commands 里的命令字面量：以某个已注册命令开头、后面还粘着字母、本身又不是命令或动作的，判为错误。
// 运行：node tools/test_button_cmds.js
const fs=require("fs"),path=require("path");
const cmds=new Set(), actions=new Set(); const files=[];
function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const st=fs.statSync(p);if(st.isDirectory())walk(p);else if(f.endsWith(".js"))files.push(p);}}
walk("world"); walk("os");
for(const p of files){const s=fs.readFileSync(p,"utf8");
  const m=s.match(/this\.command\s*=\s*["']([^"']+)["']/); if(m) cmds.add(m[1]);
  if(p.startsWith("world/cmd/")) cmds.add(path.basename(p,".js"));
  for(const a of s.matchAll(/add_action\(\s*["']([^"']+)["']/g)) actions.add(a[1]);
  for(const a of s.matchAll(/set_item\([^)]*?\[([^\]]*)\]/g)) for(const b of a[1].matchAll(/["']([\w ]+)["']/g)) actions.add(b[1]);
}
const out=[];
for(const p of files){const s=fs.readFileSync(p,"utf8");
  for(const m of s.matchAll(/send_commands\(([\s\S]*?)\);/g)){
    for(const lit of m[1].matchAll(/["']([a-z][a-z0-9_]{3,})["']/g)){const c=lit[1];
      if(cmds.has(c)||actions.has(c)) continue;
      const pre=[...cmds].filter(k=>k.length>=3&&c.startsWith(k)&&c.length>k.length).sort((a,b)=>b.length-a.length)[0];
      if(pre){const line=s.slice(0,m.index).split("\n").length; out.push(p+":"+line+"  "+c+"  → 疑似 「"+pre+" "+c.slice(pre.length)+"」");}
    }
  }
}
const hits=[...new Set(out)];
if (hits.length) { console.error("按钮命令疑似把参数粘在命令名上：\n" + hits.join("\n")); process.exit(1); }
console.log("按钮命令校验通过：没有把参数粘在命令名上的按钮。");
