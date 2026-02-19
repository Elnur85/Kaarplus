const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./apps/web/messages', function(filePath) {
  if (filePath.endsWith('.json')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // regex: find {something} but not {{something}}
    // Javascript regex for this: Replace {word} with {{word}} if not already curled.
    let updated = content.replace(/(?<!\{)\{([a-zA-Z0-9_]+)\}(?!\})/g, '{{$1}}');
    if (content !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log('Updated', filePath);
    }
  }
});
