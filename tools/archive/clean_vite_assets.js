const fs = require("fs");
const path = require("path");

const assetsDir = path.resolve(__dirname, "..", "www", "assets");
const generatedBundle = /^index-[A-Za-z0-9_-]+\.(?:js|css)$/;

if (fs.existsSync(assetsDir)) {
    for (const name of fs.readdirSync(assetsDir)) {
        if (!generatedBundle.test(name)) continue;
        fs.unlinkSync(path.join(assetsDir, name));
    }
}

