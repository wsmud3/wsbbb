const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const sourceRoot = path.join(__dirname, "..", "src");
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
const gbkDecoder = new TextDecoder("gbk");

// Build the inverse of the GBK decoder so a UTF-8 -> GBK -> UTF-8 mojibake
// sequence can be recognized without adding an encoding package dependency.
const gbkBytes = new Map();
function addGbkBytes(bytes) {
    const value = gbkDecoder.decode(Uint8Array.from(bytes));
    if (value.length !== 1 || value === "\ufffd" || value.charCodeAt(0) < 0x80) return;
    if (!gbkBytes.has(value)) gbkBytes.set(value, bytes);
}

for (let byte = 0; byte <= 0xff; byte++) addGbkBytes([byte]);
for (let lead = 0x81; lead <= 0xfe; lead++) {
    for (let trail = 0x40; trail <= 0xfe; trail++) {
        if (trail !== 0x7f) addGbkBytes([lead, trail]);
    }
}

function reverseGbk(value) {
    const bytes = [];
    for (const char of value) {
        const encoded = gbkBytes.get(char);
        if (!encoded) return null;
        bytes.push(...encoded);
    }
    try {
        return utf8Decoder.decode(Uint8Array.from(bytes));
    } catch (e) {
        return null;
    }
}

function hasHan(value) {
    return /[\u3400-\u9fff]/u.test(value);
}

function collectFiles(dir) {
    const result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) result.push(...collectFiles(full));
        else if (entry.isFile()) result.push(full);
    }
    return result;
}

const problems = [];
for (const filename of collectFiles(sourceRoot)) {
    const buffer = fs.readFileSync(filename);
    if (buffer.includes(0)) continue;

    let source;
    try {
        source = utf8Decoder.decode(buffer);
    } catch (e) {
        problems.push(`${path.relative(path.join(__dirname, ".."), filename)}: invalid UTF-8`);
        continue;
    }

    source.split(/\r?\n/).forEach((line, index) => {
        const lineNumber = index + 1;
        if (/[\ufffd\uE000-\uF8FF]/u.test(line)) {
            problems.push(`${path.relative(path.join(__dirname, ".."), filename)}:${lineNumber}: replacement/private-use character`);
        }

        // A lost GBK byte is commonly committed as an ASCII question mark.
        // Require adjacent non-ASCII text to avoid flagging normal JS ternaries.
        if (hasHan(line) && /[^\x00-\x7f]\?|\?[^\x00-\x7f]/u.test(line)) {
            problems.push(`${path.relative(path.join(__dirname, ".."), filename)}:${lineNumber}: question mark adjacent to CJK text`);
        }

        for (const run of line.match(/[^\x00-\x7f]+/g) || []) {
            const restored = reverseGbk(run);
            if (restored && restored !== run && hasHan(restored)) {
                problems.push(`${path.relative(path.join(__dirname, ".."), filename)}:${lineNumber}: likely GBK mojibake (${run} -> ${restored})`);
            }
        }
    });
}

if (problems.length) {
    console.error("Source encoding check failed:");
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
}

console.log("Source encoding check passed: all text under src is valid UTF-8 and no likely GBK mojibake was found.");
