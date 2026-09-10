// Player chat may contain game color markup, never executable HTML/attributes.
const tags = new Set('span br b i em strong red grn yel blu mag cyn wht blk hir hig hiy hib him hic hiw hiz hio ord hio hiy mem'.split(' '));
export function chatText(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value ?? '');
    for (const element of [...template.content.querySelectorAll('*')]) {
        if (!tags.has(element.localName)) element.replaceWith(document.createTextNode(element.textContent));
        else for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name);
    }
    return template.innerHTML;
}
export function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
