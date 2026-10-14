import Util from './utils/util.js';

const MessageQueue = {
    size: 3,
    max: 666,
    container: null,
    pages: null,
    count: 0,
    allow_scroll: true,
    create: function (elem, size = 3, max = 666) {
        let queue = Object.create(this);
        queue.container = elem;
        queue.pages = [];
        queue.size = size;
        queue.max = max;

        if (Util.isMobile) {
            elem.on('touchend', this.stopDrag.bind(queue));
        } else {
            elem.on('wheel', this.stopDrag.bind(queue));
        }
        queue.scroll_button = $('<div class="scroll-flag" style="display:none;"><span class="glyphicon glyphicon-chevron-down"></span></div>');
        queue.scroll_button.appendTo(elem);
        queue.scroll_button.on('pointerup', queue.start_move.bind(queue));

        return queue;
    },
    stopDrag: function (e) {
        let is_end = this.is_end();
        if (is_end === this.allow_scroll) return;
        this.allow_scroll = is_end;
        if (is_end) {
            this.scroll_button.hide();
        }
    },
    start_move: function () {
        this.allow_scroll = true;
        this.scroll_button.hide();
        this.scroll2end();
    },
    push: function (x) {
        let queue = this.pages;
        if (!queue.length) {
            queue.push($("<pre></pre>").appendTo(this.container));
        }
        if (this.count >= this.max) {
            if (queue.length >= this.size) {
                queue.splice(0, 1)[0].remove();
            }
            this.count = 0;
            queue.push($("<pre></pre>").appendTo(this.container));
        }

        let page = queue[queue.length - 1];
        page.append(x + "\n");
        this.count++;
    },
    /**
     * 弹出并返回最后一条消息。
     * 约定：push 写入的是 "msg\n"，因此页面内最后一个 \n 是结尾符，
     * 倒数第二个 \n 之前的内容需要保留。
     */
    pop: function () {
        if (!this.pages.length) return null;
        let lastPage = this.pages[this.pages.length - 1];
        let html = lastPage.html();
        if (!html) {
            lastPage.remove();
            this.pages.pop();
            return this.pop();
        }
        // 页面内容形如 "msg1\nmsg2\n...\nlastMsg\n"
        let lastNL = html.lastIndexOf("\n");
        if (lastNL < 0) {
            let popped = html;
            lastPage.remove();
            this.pages.pop();
            this.count = 0;
            return popped;
        }
        // 去掉结尾的 \n，得到 "msg1\nmsg2\n...\nlastMsg"
        let beforeTrailing = html.substring(0, lastNL);
        // 找 lastMsg 前面的 \n
        let prevNL = beforeTrailing.lastIndexOf("\n");
        let popped;
        if (prevNL >= 0) {
            // popped = "lastMsg"，页面保留 "msg1\nmsg2\n...\n"
            popped = beforeTrailing.substring(prevNL + 1);
            lastPage.html(beforeTrailing.substring(0, prevNL + 1));
        } else {
            // 页面只有一条消息，整页清空
            popped = beforeTrailing;
            lastPage.html("");
        }
        this.count = Math.max(0, this.count - 1);
        if (!lastPage.html().trim() && this.pages.length > 1) {
            lastPage.remove();
            this.pages.pop();
        }
        return popped;
    },
    clear: function () {
        for (let item of this.pages) {
            item.remove();
        }
        this.pages.length = 0;
        this.count = 0;
        this.allow_scroll = true;
        if (this.scroll_button) this.scroll_button.hide();
    },
    is_end: function () {
        if (!this.container || !this.container[0]) return true;
        const elem = this.container[0];
        const scrollHeight = elem.scrollHeight;
        const clientHeight = elem.clientHeight;
        const scrollTop = elem.scrollTop;
        return scrollTop + clientHeight >= scrollHeight - 50;
    },
    scroll2end: function () {
        if (!this.container || !this.container[0]) return;
        const elem = this.container[0];
        const scrollHeight = elem.scrollHeight;
        const clientHeight = elem.clientHeight;
        if (scrollHeight < clientHeight) return;
        if (!this.allow_scroll) {
            let rect = this.container[0].getBoundingClientRect();
            // 浮动按钮是 position:absolute，定位基准是最近的定位祖先(.container)，
            // 需把视口坐标换算成容器坐标，原来引用的 screenTop 未定义会导致 top 为 NaN
            let prect = this.container[0].parentElement.getBoundingClientRect();
            this.scroll_button.show();
            let top = rect.bottom - (this.scroll_button.height() || 35) - prect.top;
            return this.scroll_button.css('top', top);
        }
        elem.scrollTop = elem.scrollHeight;
    }
};

export default MessageQueue;
