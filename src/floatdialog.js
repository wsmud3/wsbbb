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
/* .action-desc 是 flex 行，只写 display:inline 时按钮不换行、内容多的面板会横向溢出
   （手机端尤其明显）。改为 flex + wrap，并让单个按钮自身不折行。 */
.float-dialog .fb-actions>.fb-action>.action-desc>.item-commands {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding-bottom: 0;
    white-space: normal;
}
.float-dialog .fb-actions>.fb-action>.action-desc>.item-commands>span {
    white-space: nowrap;
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
/* 尺寸档位：默认 24em；宽屏 32em；内容较多时可用 .float-size-lg 再加宽。
   手机端（<=480px）强制不超过视口宽度，避免超出屏幕外无法操作。 */
.float-dialog.float-size-lg {
    width: 36em;
}
.float-dialog-unified.float-size-lg {
    width: 36em;
}
@media (min-width: 768px) {
    .float-dialog { width: 28em; }
    .float-dialog-unified { width: 28em; }
    .float-dialog.float-size-lg { width: 40em; }
    .float-dialog-unified.float-size-lg { width: 40em; }
}
@media (min-width: 1200px) {
    .float-dialog { width: 32em; }
    .float-dialog-unified { width: 32em; }
    .float-dialog.float-size-lg { width: 46em; }
    .float-dialog-unified.float-size-lg { width: 46em; }
}
@media (max-width: 480px) {
    .float-dialog,
    .float-dialog.float-size-lg {
        width: calc(100vw - 16px);
        max-width: calc(100vw - 16px);
    }
    .float-dialog-unified,
    .float-dialog-unified.float-size-lg {
        width: calc(100vw - 20px);
        max-width: calc(100vw - 20px);
    }
    .float-dialog .fb-actions { padding: 0.4em; }
    .float-dialog .fb-actions > .fb-action { padding-left: 0.5em; }
}
`);


/** 最小转义：说明文字当纯文本显示，避免内容里的尖括号被解析成标签 */
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

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
            // 持久浮窗（自制装备重铸这类需要频繁改动的面板）是同一块面板的刷新：
            // 原地替换，不收进队列——否则每点一次按钮都会多一条"未处理的对话"，
            // 而且折叠态会随窗口销毁而丢失。
            if (this.currentDialogData && this.currentDialogData.persistent) {
                clearTimeout(this.autoTimer);
                this.autoTimer = null;
                this.currentFloat.remove();
                this.currentFloat = null;
                this.currentDialogData = null;
            } else {
                // 上一个还没处理就来了新的：收进队列
                this.hideCurrent();
            }
        }
        this.createFloatWindow({
            text: text,
            html: cmdsData.html || '',
            cmds: cmdsData.items || [],
            size: cmdsData.size || '',
            // 持久浮窗：频繁改动的面板（自制装备重铸等）点按钮不关闭、不自动收起，
            // 只有点「忽略」才收进待处理队列。折叠态也因此能在同一窗口内保持。
            persistent: cmdsData.persistent === true,
        });
        this.updateWarn();
    },

    createFloatWindow(dialog) {
        this.currentDialogData = dialog;

        // 直接复用 process.js cmds 的 item-commands HTML
        // html：服务端给的整块富内容，原样内嵌（自制装备重铸面板走这条）
        // text：说明文字，转义后显示，避免内容里的尖括号被当标签
        // 服务端给的 html 里，按钮可能同时带 cmd 属性与内联 onclick（为了兼容
        // 用 innerHTML 渲染、没有事件委托的面板，如背包「查看」）。
        // 浮窗自己有 [cmd] 委托，若保留 onclick 会在同一次点击里派发两次，
        // 因此这里把内联 onclick 剥掉，浮窗内只走 cmd 委托。
        const stripInlineOnclick = (h) => String(h || '').replace(/\sonclick="[^"]*"/gi, '');
        // 若按钮由 items 渲染（结构化菜单），html 里往往也带着同一批按钮，
        // 两者都保留会出现重复按钮，因此有 items 时把 html 里的 [cmd] 按钮剥掉。
        const stripCmdButtons = (h) => String(h || '')
            .replace(/<span\b[^>]*\bcmd="[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
        let htmlSrc = dialog.html || '';
        if (dialog.cmds && dialog.cmds.length) htmlSrc = stripCmdButtons(htmlSrc);
        let descHTML = dialog.html ? stripInlineOnclick(htmlSrc) : escapeHtml(dialog.text || '');
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

        let title = dialog.persistent ? '对话（点「忽略」收起）' : '对话';
        let inner = '<div class="float-dialog-header">' + title + '</div>' +
            '<div class="fb-actions"><div class="fb-action">' +
            '<span class="action-desc">' + descHTML + '</span>' +
            '<span class="action-name float-ignore-btn">忽<br>略</span>' +
            '</div></div>';

        let el = document.createElement('div');
        el.className = 'float-dialog' + (dialog.size === 'lg' ? ' float-size-lg' : '');
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

        // 位置夹取：保证整个浮窗始终在视口内（手机端尤其重要，避免拖出屏幕外点不到）
        let eh = el.offsetHeight;
        let clampLeft = (v) => Math.max(4, Math.min(v, Math.max(4, ww - ew - 4)));
        let clampTop = (v) => Math.max(4, Math.min(v, Math.max(4, wh - eh - 4)));
        // 有记住的位置就用记住的，否则居中
        if (FloatDialog.savedLeft !== null && FloatDialog.savedTop !== null) {
            el.style.left = clampLeft(FloatDialog.savedLeft) + 'px';
            el.style.top = clampTop(FloatDialog.savedTop) + 'px';
        } else {
            el.style.left = clampLeft((ww - ew) / 2) + 'px';
            el.style.top = clampTop((wh - eh) / 2 - 40) + 'px';
        }

        // 「替换」折叠：与主消息栏里的行为一致——
        // 进入替换模式时隐藏所有「镶嵌」按钮，只显示该词条对应的替换项；再点一次还原。
        // 位于命令判定之前，因为 .rep-word 本身不带 cmd 属性。
        el.addEventListener('click', (e) => {
            let repEl = e.target.closest('.rep-word');
            if (repEl && el.contains(repEl)) {
                e.stopPropagation();
                let wordKey = repEl.getAttribute('data-key');
                let uniq = repEl.getAttribute('data-uniq');
                let container = uniq ? el.querySelector('.rc-actions-' + uniq) : null;
                if (!container) {
                    // 没有分组容器时退化为"切换自身可见性"，至少不静默无反应
                    container = el;
                }
                if (repEl.classList.contains('rep-active')) {
                    // 取消替换模式
                    container.querySelectorAll('.rc-rep').forEach(x => { x.style.display = 'none'; });
                    container.querySelectorAll('.rc-add').forEach(x => { x.style.display = ''; });
                    repEl.classList.remove('rep-active');
                    return;
                }
                container.querySelectorAll('.rc-add').forEach(x => { x.style.display = 'none'; });
                container.querySelectorAll('.rc-rep').forEach(x => { x.style.display = 'none'; });
                container.querySelectorAll('.rc-rep-' + wordKey).forEach(x => { x.style.display = ''; });
                repEl.classList.add('rep-active');
                return;
            }

            // 命令按钮与「忽略」都用事件委托处理
            let cmdEl = e.target.closest('[cmd]');
            if (cmdEl) {
                SendCommand(cmdEl.getAttribute('cmd'));
                // 持久浮窗：不关闭，等服务器返回新内容刷新同一个窗口
                if (dialog.persistent) {
                    FloatDialog.updateWarn();
                    return;
                }
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

        // 30 秒未操作就收起并转入待处理队列；
        // 持久浮窗（需要频繁改动的面板）不自动收起，避免改到一半被吞掉。
        clearTimeout(this.autoTimer);
        this.autoTimer = null;
        if (!dialog.persistent) {
            this.autoTimer = setTimeout(() => {
                if (FloatDialog.currentFloat === el) {
                    FloatDialog.hideCurrent();
                    FloatDialog.updateWarn();
                }
            }, 30000);
        }
    },

    /** 内容较多时用较大档位（B/C 类），其余保持默认宽度 */
    _applySize(el, size) {
        if (!el) return;
        if (size === 'lg') el.classList.add('float-size-lg');
        else el.classList.remove('float-size-lg');
    },

    /** 视口变化时把浮窗拉回可视区域（横竖屏切换、手机地址栏收起等） */
    _handleResize() {
        let el = this.currentFloat;
        if (!el) return;
        let ww = window.innerWidth, wh = window.innerHeight;
        let ew = el.offsetWidth, eh = el.offsetHeight;
        el.style.left = Math.max(4, Math.min(parseFloat(el.style.left) || 4, Math.max(4, ww - ew - 4))) + 'px';
        el.style.top = Math.max(4, Math.min(parseFloat(el.style.top) || 4, Math.max(4, wh - eh - 4))) + 'px';
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

// 挂到全局：dialog/packet.js 需要在不 import 本模块的前提下使用浮窗
// （直接 import 会形成 floatdialog → dialog/base → packet → floatdialog 循环，
//  使 Dialog 在初始化中途为 undefined，顶层抛错导致白屏）
if (typeof window !== 'undefined') window.FloatDialog = FloatDialog;

export default FloatDialog;
