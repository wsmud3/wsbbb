var fs = require('fs');
var p = require('path');
var err = 0;
function check(d) {
    var es = fs.readdirSync(d, {withFileTypes: true});
    for (var i = 0; i < es.length; i++) {
        var fp = p.join(d, es[i].name);
        if (es[i].isDirectory()) { check(fp); }
        else if (es[i].name.endsWith('.js')) {
            try {
                new Function(fs.readFileSync(fp, 'utf8'));
            } catch(e) {
                if (err < 15) console.log(fp.replace('world\\map\\', '').replace(/\\/g, '/') + ': ' + e.message.substring(0, 80));
                err++;
            }
        }
    }
}
check('world/map');
console.log('Total syntax errors in room files: ' + err);
