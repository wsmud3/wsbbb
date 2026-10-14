import Dialog from './dialog/base.js';
import {SendCommand} from './client.js';

// 浮动对话窗：把 NPC 对话/交互选项从顶部对话框搬到可拖拽的浮窗，
// 这样对话不会盖住房间与战斗区域，位置还会被记住。
//
// 说明：wsbbb 目前是单色深色主题（没有主题 token 体系），因此这里直接使用
// 与 .dialog / .warn-dialog 一致的配色（#111 / #222 / gray），不引入 CSS 变量。
// 所有规则都以 .float-dialog 或 .float-dialog-unified 限定作用域：
// .fb-actions / .fb-action / .action-desc 这几个类名已被 dialog/jh.js 全局占用，
// 不加限定会互相污染。

const float_css = `
.float-dialog {
    position: fixed;
    z-index: 100;
    width: 24em;
    background: black;
    border-radius: 6px;
    border: 1px solid #343434;
    box-shadow: 0 0 40px rgba(0,0,0,0.7);
    user-select: none;
    overflow: hidden;
}
.float-dialog>.float-dialog-header {
    height: 1.6em;
    line-height: 1.6em;
    background: #222;
    padding: 0 0.5em;
    cursor: move;
    border-radius: 6px 6px 0 0;
    color: #ffff00;
    font-size: 0.8em;
    font-weight: bold;
    touch-action: none;
}
.float-dialog .fb-actions {
    margin-top: 0;
    padding: 0.5em;
}
.float-dialog .fb-actions>.fb-action {
    line-height: 2em;
    padding-left: 1em;
    border-radius: 4px;
    border-left: 2px solid gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-bottom: 0;
    background-color: #111;
    cursor: default;
    display: flex;
    flex-direction: row;
}
.float-dialog .fb-actions>.fb-action>.action-desc {
    flex: 1;
    white-space: pre-wrap;
    color: #898989;
    overflow-x: auto;
    scrollbar-width: none;
    padding-right: 1em;
    line-height: 1.8em;
}
.float-dialog .fb-actions>.fb-action>.action-desc::-webkit-scrollbar {
    display: none;
}
/* 命令按钮沿用仓库原生的 .item-commands>span 外观，这里只把容器改回行内 */
.float-dialog .fb-actions>.fb-action>.action-desc>.item-commands {
    display: inline;
    padding-bottom: 0;
}
.float-dialog .fb-actions>.fb-action>.action-name {
    flex: 0;
    background-color: #222;
    padding: 0.3em 0.5em;
    cursor: pointer;
    color: #FF0000;
    text-align: center;
    line-height: 1.6em;
    font-weight: bold;
    font-size: 0.95em;
    transition: background-color 0.15s, color 0.15s;
}
.float-dialog .fb-actions>.fb-action>.action-name:hover {
    background-color: black;
    color: #FF0000;
}
.float-dialog-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.55);
    z-index: 150;
}
.float-dialog-unified {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 151;
    width: 24em;
    max-height: 50vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: black;
    border-radius: 6px;
    border: 1px solid #343434;
    box-shadow: 0 0 40px rgba(0,0,0,0.7);
}
.float-dialog-unified>.unified-fade {
    position: sticky;
    bottom: 0;
    left: 0; right: 0;
    height: 2.5em;
    background: linear-gradient(to bottom, transparent, #111);
    pointer-events: none;
    border-radius: 0 0 6px 6px;
}
.float-dialog-unified>.unified-header {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 1.8em;
    line-height: 1.8em;
    background: #222;
    padding: 0 0.5em;
    border-radius: 6px 6px 0 0;
    color: #ffff00;
    font-size: 0.85em;
    font-weight: bold;
    display: flex;
}
.float-dialog-unified>.unified-header>.unified-title {
    flex: 1;
}
.float-dialog-unified>.unified-header>.unified-close {
    color: gray;
    cursor: pointer;
    padding: 0 0.3em;
    transition: color 0.15s;
}
.float-dialog-unified>.unified-header>.unified-close:hover {
    color: #FF0000;
}
.float-dialog-unified .fb-actions {
    margin-top: 0;
    padding: 0.5em;
}
.float-dialog-unified .fb-actions>.fb-action {
    line-height: 2em;
    padding-left: 1em;
    border-radius: 4px;
    border-left: 2px solid gray;
    white-space: nowrap;
    overflow-x: auto;
    margin-bottom: 0.5em;
    background-color: #111;
    display: flex;
    flex-direction: row;
}
.float-dialog-unified .fb-actions>.fb-action>.action-desc {
    flex: 1;
    white-space: pre-wrap;
    color: #898989;
    overflow-x: auto;
    scrollbar-width: none;
    padding-right: 1em;
    line-height: 1.8em;
}
.float-dialog-unified .fb-actions>.fb-action>.action-desc::-webkit-scrollbar {
    display: none;
}
.float-dialog-unified .fb-actions>.fb-action>.action-desc>.item-commands {
    display: inline;
    padding-bottom: 0;
}
.float-dialog-unified .fb-actions>.fb-action>.action-name {
    flex: 0;
    background-color: #222;
    padding: 0.3em 0.5em;
    cursor: pointer;
    color: #FF0000;
    text-align: center;
    line-height: 1.6em;
    font-weight: bold;
    font-size: 0.95em;
    transition: background-color 0.15s, color 0.15s;
}
.float-dialog-unified .fb-actions>.fb-action>.action-name:hover {
    background-color: black;
    color: #FF0000;
}
/* 未处理对话的提示条沿用仓库已有的 .warn-dialog 外观，只补按钮配色 */
.float-warn > .item-commands > .float-view-btn {
    color: #00FF00 !important;
    border-color: #008000 !important;
}
.float-warn > .item-commands > .float-ignoreall-btn {
    color: #FF0000 !important;
    border-color: #800000 !important;
}
`;

Dialog.injectStyle(float_css + `
@media (min-width: 1200px) {
    .float-dialog {
        width: 36em;
    }
    .float-dialog-unified {
        width: 36em;
    }
}
`);


const FloatDialog = {
    /** 未被处理的对话（超时或主动收起后进这里排队） */
    pendingDialogs: [],
    currentFloat: null,
    currentDialogData: null,
    warnEl: null,
    autoTimer: null,
    savedLeft: null,
    savedTop: null,

    add(text, cmdsData) {
        if (!cmdsData) return;
        if (this.currentFloat) {
            // 上一个还没处理就来了新的：收进队列
            this.hideCurrent();
        }
        this.createFloatWindow({text, cmds: cmdsData.items || []});
        this.updateWarn();
    },

    createFloatWindow(dialog) {
        this.currentDialogData = dialog;

        // 直接复用 process.js cmds 的 item-commands HTML
        let descHTML = dialog.text || '';
        if (dialog.cmds.length) {
            descHTML += "<div class='item-commands'>";
            for (var i = 0; i < dialog.cmds.length; i++) {
                const {cmd, name, text, br, group} = dialog.cmds[i];
                if (group) descHTML += "<div class='command-group-title'>" + group + "</div>";
                descHTML += "<span cmd='" + cmd + "'>" + name + "</span>";
                if (text) descHTML += text;
                if (br) descHTML += "<br>";
            }
            descHTML += "</div>";
        }

        let inner = '<div class="float-dialog-header">对话</div>' +
            '<div class="fb-actions"><div class="fb-action">' +
            '<span class="action-desc">' + descHTML + '</span>' +
            '<span class="action-name float-ignore-btn">忽<br>略</span>' +
            '</div></div>';

        let el = document.createElement('div');
        el.className = 'float-dialog';
        el.innerHTML = inner;

        // 跟随全局字号（.container 上的 font-size）
        let container = document.querySelector('.container');
        if (container) {
            el.style.fontSize = getComputedStyle(container).fontSize;
        }

        // 先入文档，才能量出宽度用于定位
        document.body.appendChild(el);

        let ww = window.innerWidth;
        let wh = window.innerHeight;
        let ew = el.offsetWidth;

        // 有记住的位置就用记住的，否则居中
        if (FloatDialog.savedLeft !== null && FloatDialog.savedTop !== null) {
            el.style.left = Math.max(0, Math.min(FloatDialog.savedLeft, ww - ew)) + 'px';
            el.style.top = Math.max(0, FloatDialog.savedTop) + 'px';
        } else {
            el.style.left = Math.max(0, (ww - ew) / 2) + 'px';
            el.style.top = Math.max(0, (wh - 100) / 2) + 'px';
        }

        // 命令按钮与「忽略」都用事件委托处理
        el.addEventListener('click', (e) => {
            let cmdEl = e.target.closest('[cmd]');
            if (cmdEl) {
                SendCommand(cmdEl.getAttribute('cmd'));
                FloatDialog.dismissCurrent();
                FloatDialog.updateWarn();
                return;
            }
            let ignoreEl = e.target.closest('.float-ignore-btn');
            if (ignoreEl) {
                FloatDialog.dismissCurrent();
                FloatDialog.updateWarn();
                return;
            }
        });

        this.currentFloat = el;

        this._setupDrag(el);

        // 30 秒未操作就收起并转入待处理队列
        clearTimeout(this.autoTimer);
        this.autoTimer = setTimeout(() => {
            if (FloatDialog.currentFloat === el) {
                FloatDialog.hideCurrent();
                FloatDialog.updateWarn();
            }
        }, 30000);
    },

    _setupDrag(el) {
        let header = el.querySelector('.float-dialog-header');
        if (!header) return;

        header.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            header.setPointerCapture(e.pointerId);

            let sx = e.clientX;
            let sy = e.clientY;
            let rect = el.getBoundingClientRect();
            let ox = rect.left;
            let oy = rect.top;

            let move = (ev) => {
                el.style.left = (ox + ev.clientX - sx) + 'px';
                el.style.top = (oy + ev.clientY - sy) + 'px';
            };

            let up = () => {
                header.removeEventListener('pointermove', move);
                header.removeEventListener('pointerup', up);
                try { header.releasePointerCapture(e.pointerId); } catch (err) { /* 已释放 */ }
                // 记住位置，下一次浮窗沿用
                let finalRect = el.getBoundingClientRect();
                FloatDialog.savedLeft = finalRect.left;
                FloatDialog.savedTop = finalRect.top;
            };

            header.addEventListener('pointermove', move);
            header.addEventListener('pointerup', up);
        });
    },

    /** 收起但保留内容，转入待处理队列 */
    hideCurrent() {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
        if (this.currentFloat) {
            this.currentFloat.remove();
            this.currentFloat = null;
        }
        if (this.currentDialogData) {
            this.pendingDialogs.unshift(this.currentDialogData);
            if (this.pendingDialogs.length > 20) {
                this.pendingDialogs.pop();
            }
            this.currentDialogData = null;
        }
    },

    /** 收起并丢弃内容 */
    dismissCurrent() {
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
        if (this.currentFloat) {
            this.currentFloat.remove();
            this.currentFloat = null;
        }
        this.currentDialogData = null;
    },

    /** 在底部栏上方显示「未处理的对话 (n)」提示条 */
    updateWarn() {
        let count = this.pendingDialogs.length;
        if (this.warnEl) {
            this.warnEl.remove();
            this.warnEl = null;
        }
        if (!count) return;

        let el = document.createElement('div');
        el.className = 'warn-dialog float-warn';
        el.innerHTML = '<div class="warn-content">未处理的对话 (' + count + ')</div>' +
            '<div class="item-commands">' +
            '<span class="float-view-btn">查看</span>' +
            '<span class="float-ignoreall-btn">忽略</span>' +
            '</div>';

        el.querySelector('.float-view-btn').addEventListener('click', () => {
            FloatDialog.showUnified();
        });
        el.querySelector('.float-ignoreall-btn').addEventListener('click', () => {
            FloatDialog.ignoreAll();
        });

        let bottomBar = document.querySelector('.bottom-bar');
        if (bottomBar) {
            bottomBar.appendChild(el);
            this._positionWarn();
        }

        this.warnEl = el;
    },

    /** 底部栏可能同时挂着其它提示条（如系统警告），逐个往上摞 */
    _positionWarn() {
        let bottomBar = document.querySelector('.bottom-bar');
        if (!bottomBar) return;
        let height = bottomBar.offsetHeight + 8;
        document.querySelectorAll('.bottom-bar > .warn-dialog').forEach((el) => {
            el.style.bottom = height + 'px';
            height += el.offsetHeight + 6;
        });
    },

    ignoreAll() {
        this.pendingDialogs.length = 0;
        if (this.currentFloat) {
            this.currentFloat.remove();
            this.currentFloat = null;
            this.currentDialogData = null;
        }
        if (this.warnEl) {
            this.warnEl.remove();
            this.warnEl = null;
        }
    },

    /** 「查看」：把所有待处理对话汇总到一个浮层里逐条处理 */
    showUnified() {
        if (this.currentFloat && this.currentDialogData) {
            this.pendingDialogs.push(this.currentDialogData);
            this.currentFloat.remove();
            this.currentFloat = null;
            this.currentDialogData = null;
        }
        if (this.warnEl) {
            this.warnEl.remove();
            this.warnEl = null;
        }

        if (!this.pendingDialogs.length) return;

        let itemsHTML = '';
        for (let di = 0; di < this.pendingDialogs.length; di++) {
            let d = this.pendingDialogs[di];
            // 直接复用 process.js cmds 的 item-commands HTML
            let descHTML = d.text || '';
            if (d.cmds.length) {
                descHTML += "<div class='item-commands'>";
                for (var ci = 0; ci < d.cmds.length; ci++) {
                    const {cmd, name, text, br} = d.cmds[ci];
                    descHTML += "<span cmd='" + cmd + "'>" + name + "</span>";
                    if (text) descHTML += text;
                    if (br) descHTML += "<br>";
                }
                descHTML += "</div>";
            }
            itemsHTML += '<div class="fb-action" data-di="' + di + '">' +
                '<span class="action-desc">' + descHTML + '</span>' +
                '<span class="action-name unified-ignore-one">忽<br>略</span>' +
                '</div>';
        }

        let overlay = document.createElement('div');
        overlay.className = 'float-dialog-overlay';

        let unified = document.createElement('div');
        unified.className = 'float-dialog-unified';
        let container = document.querySelector('.container');
        if (container) {
            unified.style.fontSize = getComputedStyle(container).fontSize;
        }
        unified.innerHTML = '<div class="unified-header">' +
            '<span class="unified-title">未处理的对话</span>' +
            '<span class="unified-close glyphicon glyphicon-remove-circle"></span>' +
            '</div>' +
            '<div class="fb-actions">' + itemsHTML + '</div>' +
            '<div class="unified-fade"></div>';

        document.body.appendChild(overlay);
        document.body.appendChild(unified);

        // 内容还能往下滚时保留底部渐隐，滚到底就淡出
        let fade = unified.querySelector('.unified-fade');
        let checkFade = () => {
            if (!fade) return;
            let atBottom = unified.scrollTop + unified.clientHeight >= unified.scrollHeight - 6;
            fade.style.opacity = atBottom ? '0' : '1';
        };
        unified.addEventListener('scroll', checkFade);
        setTimeout(checkFade, 100);

        let close = () => {
            overlay.remove();
            unified.remove();
            FloatDialog.pendingDialogs.length = 0;
            if (FloatDialog.warnEl) {
                FloatDialog.warnEl.remove();
                FloatDialog.warnEl = null;
            }
        };

        overlay.addEventListener('click', close);
        unified.querySelector('.unified-close').addEventListener('click', close);

        // 命令按钮与单条「忽略」都用事件委托；处理完要重排 data-di 索引
        let reindex = () => {
            unified.querySelectorAll('.fb-action').forEach((fb, i) => {
                fb.setAttribute('data-di', i);
            });
        };
        unified.addEventListener('click', (e) => {
            let cmdEl = e.target.closest('[cmd]');
            if (cmdEl) {
                let fbAction = cmdEl.closest('.fb-action');
                let di = parseInt(fbAction.getAttribute('data-di'), 10);
                SendCommand(cmdEl.getAttribute('cmd'));
                if (di >= 0) FloatDialog.pendingDialogs.splice(di, 1);
                fbAction.remove();
                reindex();
                checkFade();
                if (!FloatDialog.pendingDialogs.length) close();
                return;
            }
            let ignoreEl = e.target.closest('.unified-ignore-one');
            if (ignoreEl) {
                let fbAction = ignoreEl.closest('.fb-action');
                let di = parseInt(fbAction.getAttribute('data-di'), 10);
                if (di >= 0 && di < FloatDialog.pendingDialogs.length) {
                    FloatDialog.pendingDialogs.splice(di, 1);
                }
                fbAction.remove();
                reindex();
                checkFade();
                if (!FloatDialog.pendingDialogs.length) close();
            }
        });
    }
};

export default FloatDialog;
