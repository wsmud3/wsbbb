import Setting from '../setting.js';
import * as ToolAction from './tool.js';

// 顶部对话框打开时会盖住右侧菜单栏，导致玩家点不到菜单切换面板。
// 本模块在对话框打开/尺寸变化时重新计算可用空间，并按玩家选择的策略
// 让菜单让位：重排成多列 / 隐藏 / 遮蔽成可滚动 / 不变。
// 仅使用 DOM 几何测量 + CSS 类切换，不引入任何框架依赖。

const DEFAULT_LAYOUT = 'reflow';
const LAYOUTS = new Set(['reflow', 'hide', 'shield', 'unchanged']);

let dialogOpen = false;
let layoutFrame = null;
let sizeObserver = null;
let scrollBar = null;
let menuHiddenByDialog = false;
// ResizeObserver 回调里会改 rightBar 的宽高，这本身又会触发一次尺寸通知。
// 若在「应用布局」过程中收到新请求，只记标记，等本次应用结束后再排一帧，
// 避免在同一轮通知里反复重排。
let applying = false;
let relayoutRequested = false;

function elements() {
    return {
        dialog: document.querySelector('.dialog'),
        bottomBar: document.querySelector('.bottom-bar'),
        rightBar: document.querySelector('.right-bar'),
    };
}

// 当前真正可见的菜单项。关闭按钮不参与布局计算（它由 dlog_cbtn 单独控制）。
function visibleTools(rightBar) {
    return Array.from(rightBar.children).filter(item =>
        !item.classList.contains('dialog-close-tool')
        && getComputedStyle(item).display !== 'none'
    );
}

function resetLayout() {
    if (layoutFrame) {
        cancelAnimationFrame(layoutFrame);
        layoutFrame = null;
    }

    const {dialog, bottomBar, rightBar} = elements();
    dialog?.classList.remove('menu-shield-active', 'menu-shield-top');
    const dialogClose = dialog?.querySelector('.dialog-close');
    dialogClose?.classList.remove('glyphicon-remove');
    dialogClose?.classList.add('glyphicon-remove-circle');
    bottomBar?.classList.remove('menu-scroll-bottom-shield');
    bottomBar?.style.removeProperty('--menu-scroll-width');
    bottomBar?.style.removeProperty('--menu-scroll-bottom');
    if (scrollBar) {
        scrollBar.removeEventListener('scroll', updateShieldIndicators);
        scrollBar = null;
    }
    if (!rightBar) return;

    const closeTool = rightBar.querySelector('.dialog-close-tool');
    if (closeTool) closeTool.style.display = 'none';
    // 「替换」模式把底部 br-tool 临时改成关闭按钮，复位时要还原它原本的展开菜单职责。
    const moreTool = bottomBar?.querySelector('.br-tool');
    if (moreTool?.classList.contains('dialog-close-replacement')) {
        moreTool.classList.remove('dialog-close-replacement');
        moreTool.setAttribute('command', 'showtool');
        moreTool.replaceChildren();
    }
    rightBar.classList.remove('menu-reflow-layout', 'menu-scroll-layout');
    rightBar.style.removeProperty('height');
    rightBar.style.removeProperty('width');
    for (const item of rightBar.children) {
        item.style.removeProperty('right');
        item.style.removeProperty('bottom');
    }
}

// 对话框底边与菜单底边之间剩下的纵向空间
function availableMenuSpace(dialog, bottomBar, rightBar) {
    const dialogBottom = dialog.getBoundingClientRect().bottom;
    const bottomBarRect = bottomBar.getBoundingClientRect();
    const bottomOffset = parseFloat(getComputedStyle(rightBar).bottom) || 0;
    const menuBottom = bottomBarRect.bottom - bottomOffset;
    return {
        dialogBottom,
        menuBottom,
        height: Math.max(0, menuBottom - dialogBottom),
    };
}

// 单个菜单项的占位步长（含外边距），用于计算可用行列数
function toolStep(item) {
    const rect = item.getBoundingClientRect();
    const style = getComputedStyle(item);
    return {
        x: rect.width + (parseFloat(style.marginRight) || 0),
        y: rect.height + (parseFloat(style.marginBottom) || 0),
    };
}

function reflowMenu(dialog, bottomBar, rightBar, tools) {
    const naturalTop = rightBar.getBoundingClientRect().top;
    const space = availableMenuSpace(dialog, bottomBar, rightBar);
    if (naturalTop >= space.dialogBottom || !tools.length) return;

    const step = toolStep(tools[0]);
    const rows = Math.max(1, Math.floor(space.height / step.y));
    const columns = Math.ceil(tools.length / rows);

    rightBar.classList.add('menu-reflow-layout');
    rightBar.style.height = Math.min(space.height, rows * step.y) + 'px';
    rightBar.style.width = columns * step.x + 'px';

    // 菜单原本是从下往上读的。先填满最右列，再向左一列一列地自下而上继续填，
    // 这样视觉顺序与展开前一致。
    const bottomUpTools = tools.slice().reverse();
    for (let index = 0; index < bottomUpTools.length; index++) {
        const item = bottomUpTools[index];
        item.style.bottom = (index % rows) * step.y + 'px';
        item.style.right = Math.floor(index / rows) * step.x + 'px';
    }
}

function shieldMenu(dialog, bottomBar, rightBar, tools) {
    const naturalTop = rightBar.getBoundingClientRect().top;
    const space = availableMenuSpace(dialog, bottomBar, rightBar);
    if (naturalTop >= space.dialogBottom || !tools.length) return;

    const step = toolStep(tools[0]);
    dialog.classList.add('menu-shield-active');
    rightBar.classList.add('menu-scroll-layout');
    rightBar.style.height = space.height + 'px';
    rightBar.style.width = step.x + 'px';
    bottomBar.style.setProperty('--menu-scroll-width', step.x + 'px');
    bottomBar.style.setProperty('--menu-scroll-bottom', getComputedStyle(rightBar).bottom);

    // 初始让最低的菜单项贴在底部；把菜单往下拖会减小 scrollTop，
    // 从而把上方被遮住的项拉进视野。
    rightBar.scrollTop = rightBar.scrollHeight;
    scrollBar = rightBar;
    scrollBar.addEventListener('scroll', updateShieldIndicators, {passive: true});
    updateShieldIndicators();
}

// 遮蔽态下用两道渐隐遮罩提示「上面还有 / 下面还有」未显示的菜单项
function updateShieldIndicators() {
    if (!scrollBar) return;
    const {dialog, bottomBar} = elements();
    const maxScroll = Math.max(0, scrollBar.scrollHeight - scrollBar.clientHeight);
    const hasHiddenAbove = scrollBar.scrollTop > 1;
    const hasHiddenBelow = scrollBar.scrollTop < maxScroll - 1;
    dialog?.classList.toggle('menu-shield-top', hasHiddenAbove);
    bottomBar?.classList.toggle('menu-scroll-bottom-shield', hasHiddenBelow);
}

function applyLayout() {
    layoutFrame = null;
    if (!dialogOpen) return;
    if (applying) {
        relayoutRequested = true;
        return;
    }
    applying = true;
    try {
        resetLayout();
        const {dialog, bottomBar, rightBar} = elements();
        if (!dialog || !bottomBar || !rightBar) return;

        const tools = visibleTools(rightBar);
        const layout = LAYOUTS.has(Setting.w_type) ? Setting.w_type : DEFAULT_LAYOUT;
        if (layout === 'hide') {
            if (tools.length) menuHiddenByDialog = true;
            ToolAction.HideTools();
            if (Setting.dlog_cbtn == 1) {
                // 额外：在菜单栏顶部单独插一个关闭按钮
                const closeTool = rightBar.querySelector('.dialog-close-tool');
                if (closeTool) closeTool.style.display = 'flex';
            } else if (Setting.dlog_cbtn == 2) {
                // 替换：把底部 br-tool 改成关闭按钮，不额外占位
                const moreTool = bottomBar.querySelector('.br-tool');
                if (moreTool) {
                    moreTool.classList.add('dialog-close-replacement');
                    moreTool.setAttribute('command', 'closedialog');
                    moreTool.innerHTML = '<span class="glyphicon glyphicon-remove-circle tool-icon"></span>'
                        + '<span class="tool-text">关闭</span>';
                }
                const dialogClose = dialog.querySelector('.dialog-close');
                dialogClose?.classList.remove('glyphicon-remove-circle');
                dialogClose?.classList.add('glyphicon-remove');
            }
        } else if (layout === 'reflow') {
            reflowMenu(dialog, bottomBar, rightBar, tools);
        } else if (layout === 'shield') {
            shieldMenu(dialog, bottomBar, rightBar, tools);
        }
    } finally {
        applying = false;
    }
    if (relayoutRequested) {
        relayoutRequested = false;
        scheduleLayout();
    }
}

// 合并同一帧内的多次重排请求，避免连续读取几何属性造成布局抖动
function scheduleLayout() {
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(applyLayout);
}

export function onDialogOpen() {
    const wasOpen = dialogOpen;
    dialogOpen = true;
    if (!wasOpen) menuHiddenByDialog = false;
    sizeObserver?.disconnect();
    if (window.ResizeObserver) {
        const {dialog, bottomBar} = elements();
        sizeObserver = new ResizeObserver(scheduleLayout);
        if (dialog) sizeObserver.observe(dialog);
        if (bottomBar) sizeObserver.observe(bottomBar);
    }
    scheduleLayout();
}

export function onDialogClose() {
    dialogOpen = false;
    sizeObserver?.disconnect();
    sizeObserver = null;
    resetLayout();
    if (menuHiddenByDialog) {
        menuHiddenByDialog = false;
        ToolAction.OpenTools();
    }
}

window.addEventListener('resize', scheduleLayout);
// 字号/布局类设置变更后需要重新测量
window.addEventListener('menu-layout-change', scheduleLayout);
