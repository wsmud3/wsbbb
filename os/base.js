/*

定义当对象从文件生成时的基类，
当文件内部调用this.inherit(父类名)后，将真正继承父类的原型和实例属性。
但是文件内部不能修改this.prototype，修改将会作用到父类上面。
可以用this.XXX扩展属性和方法
*/

BASE = function () {

}

BASE.prototype.set = function (pars) {
    if (!pars) return;
    for (var item in pars) {
        this[item] = pars[item];
    }
}
/*
该方法使用直接赋值方式继承父对象的所有原型方法，
如果子对象对原型修改，将会改变父对象的原型。
所以该方法只能获取父对象的原型不能修改它，

实际上是作为new的另外一种方式，通过apply获取实例属性，通过__proto__获取父类原型

*/
BASE.prototype.inherits = function (ctor) {
    this.__proto__ = ctor.prototype;
    ctor.apply(this);
}
/*
create方法由继承自base类的类自己实现，当对象被从文件创建时候调用
参数fname=该对象的文件的相对路径,ctor=构造方法
*/
BASE.prototype.create = function (fname, ctor) {
}
BASE.prototype.add_event = function (fname, func, time) {
    ///在time秒内用新的func替换旧的fname方法
    if (!this[fname])
        this[fname] = this.fire_event.bind(this, fname);
    if (!this._events) this._events = {};
    if (!this._events[fname]) this._events[fname] = [];
    this._events[fname].push({
        func: func,
        time: time ? (Date.now() + time) : Number.MAX_SAFE_INTEGER
    });
    //var old_func = this[fname];
    //this[fname] = func;
    //if (time) this.call_out(() =>  this[fname] = old_func, time);
    //return old_func;
}
BASE.prototype.remove_event = function (name, func) {
    if (!this._events) return;
    var evts = this._events[name];
    if (!evts) return;
    for (var i = 0; i < evts.length; i++) {
        if (evts[i].func === func) {
            evts.splice(i, 1);
            i--;
        }
    }

    if (!evts.length) {
        this._events[name] = null;
        this[name] = null;
    }
}
BASE.prototype.fire_event = function (name) {
    if (!this._events) return;
    var evts = this._events[name];
    if (!evts) return;
    var dt = Date.now();
    for (var i = 0; i < evts.length; i++) {
        if (evts[i].time > dt) {
            if (evts[i].func.call(this) == false) return false;
        } else {
            evts.splice(i, 1);
            i--;
        }
    }
    if (!evts.length) {
        this._events[name] = null;
        this[name] = null;
    }
}
/*
生成对象标识，前8位是毫秒级时间戳的36进制形式，后4位随机码，
最起码保证每毫秒生成的标识不会重复
*/
var key = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
BASE.prototype.create_uid = function () {
    var str = [];
    str.push(Date.now().toString(36));
    var length = key.length;
    for (var i = 0; i < 4; i++) {
        str.push(key[Math.floor(Math.random() * length)]);
    }
    return str.join("");
}
BASE.prototype.random = function (num) {
    return Math.floor(Math.random() * num);
}
BASE.prototype.call_out = function (func, time, arg1, arg2) {
    return setTimeout(func.bind(this, arg1, arg2), time);
}
BASE.prototype.call_interval = function (func, time, count, end_func) {
    count--;
    var index = 0;
    if (func(index++) === false || count === 0) {
        return end_func && end_func();
    }
    var handler = 0;
    handler = setInterval(function () {

        count--;
        if (func(index++) === false || count === 0) {
            clearInterval(handler);
            end_func && end_func();
        }
    }, time);
    return handler;
}


const vm = require('vm');
const fs = require("fs");

// 修复源文件中的两类换行问题：
// 1. 代码中的字面 \n（反斜杠+n）→ 还原为真正的换行符
// 2. 字符串内的真实换行 → 用 \n 转义序列替代（合并跨行字符串）
function sanitizeScript(src) {
    var out = [];
    var i = 0;
    var inSingle = false, inDouble = false, inTemplate = false;
    var inLineComment = false, inBlockComment = false;

    while (i < src.length) {
        var ch = src[i];

        // 处理字符串内的真实换行：用 \n 转义替代并跳过后续空白
        if ((ch === '\n' || (ch === '\r' && src[i + 1] === '\n')) &&
            (inSingle || inDouble || inTemplate)) {
            out.push('\\');
            out.push('n');
            // 跳过 \r\n 或 \n
            if (ch === '\r') i += 2; else i++;
            // 跳过下一行的前导空白
            while (i < src.length && (src[i] === '\t' || src[i] === ' ')) {
                i++;
            }
            continue;
        }

        // 检测字面 \n
        if (src[i] === '\\' && src[i + 1] === 'n') {
            if (inSingle || inDouble || inTemplate) {
                // 字符串内：保持原样
                out.push('\\');
                out.push('n');
                i += 2;
                continue;
            }
            if (inLineComment) {
                // 行注释内的 \n：判断后续字符决定是否结束注释
                var nextCh = src[i + 2];
                // 后面跟引号/<标签/非ASCII中文 → 注释内字符串，保留 \n
                if (nextCh === '"' || nextCh === "'" || nextCh === '`' || nextCh === '<') {
                    out.push('\\');
                    out.push('n');
                } else if (nextCh && nextCh.charCodeAt(0) > 127) {
                    out.push('\\');
                    out.push('n');
                } else {
                    // 后面是代码（字母/数字/括号等）→ 结束注释
                    inLineComment = false;
                    out.push('\n');
                }
                i += 2;
                continue;
            }
            // 块注释内或无注释：输出换行
            out.push('\n');
            i += 2;
            continue;
        }

        // 跟踪注释状态（仅在字符串外）
        if (!inSingle && !inDouble && !inTemplate) {
            if (!inLineComment && !inBlockComment) {
                if (src[i] === '/' && src[i + 1] === '/') {
                    inLineComment = true;
                } else if (src[i] === '/' && src[i + 1] === '*') {
                    inBlockComment = true;
                }
            }
            if (inLineComment && ch === '\n') {
                inLineComment = false;
            }
            if (inBlockComment && src[i] === '*' && src[i + 1] === '/') {
                out.push('*');
                out.push('/');
                i += 2;
                inBlockComment = false;
                continue;
            }
        }

        // 跟踪引号状态（仅在注释外）
        if (!inLineComment && !inBlockComment) {
            if (ch === "'" && !inDouble && !inTemplate) {
                if (i === 0 || src[i - 1] !== '\\') {
                    inSingle = !inSingle;
                }
            } else if (ch === '"' && !inSingle && !inTemplate) {
                if (i === 0 || src[i - 1] !== '\\') {
                    inDouble = !inDouble;
                }
            } else if (ch === '`' && !inSingle && !inDouble) {
                if (i === 0 || src[i - 1] !== '\\') {
                    inTemplate = !inTemplate;
                }
            }
        }

        out.push(ch);
        i++;
    }
    return out.join('');
}

//根据文件路径new一个对象
BASE.ITEMS = {};
BASE.CREATE = function (path, fname) {

    var ary = BASE.PATH_REG.exec(fname);
    if (!ary) {
        return console.error("path %s is incorrect:", path + fname);
    }
    fname = ary[1];
    var paras = ary[2];
    var fkey = path + fname;
    var func = BASE.ITEMS[fkey];
    if (func) {
        // 检查磁盘文件是否比缓存更新，若有更新则强制重读
        const filepath = fkey + ".js";
        try {
            var diskStat = fs.statSync(filepath);
            if (func._mtime && diskStat.mtimeMs > func._mtime) {
                // 文件已更新，清除缓存后重新加载
                delete BASE.ITEMS[fkey];
                // 同时清除二级缓存：NPC_STROE / OBJ_STROE
                if (WORLD && WORLD.NPC_STROE) WORLD.NPC_STROE.delete(fname);
                if (WORLD && WORLD.OBJ_STROE) WORLD.OBJ_STROE.delete(fname);
            } else {
                return BASE.NEW(fname, func, paras);
            }
        } catch (e) {
            // stat失败（文件被删除等），继续使用缓存
            return BASE.NEW(fname, func, paras);
        }
    }
    const filepath = fkey + ".js";
    try {
        const script = fs.readFileSync(filepath);
        const src = sanitizeScript(script.toString());
        func = vm.compileFunction(src, [],
            { filename: filepath });

        // 记录文件修改时间用于缓存失效检测
        try {
            func._mtime = fs.statSync(filepath).mtimeMs;
        } catch (e2) {}

        BASE.ITEMS[fkey] = func;
        return BASE.NEW(fname, func, paras);
    } catch (e) {
        console.error("create %s%s error:", filepath, e, e.stack);
    }
}
BASE.CLONE = function (fname) {
}
BASE.PATH_REG = /^(\w+(?:\/\w+)*)(#\w+)?$/;
BASE.NEW = function (fname, func, par) {
    var obj = new BASE();
    func.apply(obj);
    obj.path = fname;
    obj.create(fname, par);
    return obj;
}

BASE.UPDATE = function (path, fname) {
    var ary = BASE.PATH_REG.exec(fname);
    if (!ary) {
        throw "path " + fname + " is incorrect:";
    }
    fname = ary[1];
    var fkey = path + fname;
    var filepath = fkey + ".js";
    var data = fs.readFileSync(filepath);
    data = sanitizeScript(data.toString());
    // 使用 vm.compileFunction 与 BASE.CREATE 保持一致（不用 new Function）
    var func = vm.compileFunction(data, [],
        { filename: filepath });

    // 记录文件修改时间用于缓存失效检测
    try {
        func._mtime = fs.statSync(filepath).mtimeMs;
    } catch (e2) {}

    BASE.ITEMS[fkey] = func;
    var obj = new BASE();
    func.apply(obj);
    obj.path = fname;
    obj.update && obj.update(fname, ary[2]);
}
