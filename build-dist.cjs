const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      if (child === 'node_modules' || child === '.git' || child === 'dist') continue;
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy essential files to dist
const itemsToCopy = [
  'index.html',
  'portfolio-detail.html',
  'Promo-Website-UMKM.html',
  'demo-korindo-terpal.html',
  'poll-config.js',
  'js',
  'images',
  'ducks',
  'public',
  'dashboard',
  'host',
  'vote',
  'icebreaking',
  'demo-korindo-terpal',
  'Promo-Website-UMKM'
];

itemsToCopy.forEach(item => {
  const src = path.join(rootDir, item);
  const dest = path.join(distDir, item);
  copyRecursive(src, dest);
});

// Also ensure dist/live-poll has the built assets
const livePollDist = path.join(rootDir, 'live-poll', 'dist');
if (fs.existsSync(livePollDist)) {
  copyRecursive(livePollDist, path.join(distDir, 'live-poll', 'dist'));
}

console.log('Dist built successfully with all routes & assets synchronized!');
