const fs = require('fs');
const path = require('path');
const dir = './src/tools/definitions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for(let f of files) {
  let p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  if(c.includes('../../utils/responseFormatter"')) {
     c = c.replace('../../utils/responseFormatter"', '../../utils/responseFormatter.js"');
     fs.writeFileSync(p, c);
  } else if (c.includes("../../utils/responseFormatter';")) {
     c = c.replace("../../utils/responseFormatter';", "../../utils/responseFormatter.js';");
     fs.writeFileSync(p, c);
  }
}
let inboxPrim = './src/tools/primitives/getInboxTasks.ts';
if(fs.existsSync(inboxPrim)) {
    let c = fs.readFileSync(inboxPrim, 'utf8');
    c = c.replace('../../utils/responseFormatter"', '../../utils/responseFormatter.js"');
    fs.writeFileSync(inboxPrim, c);
}
