var fs = require('fs');
var c = fs.readFileSync('boss-simulator-v3.html', 'utf8');

// Add emoji field to ending data
c = c.replace("bankrupt:{cn:{title:'\u{1f4b8}", "bankrupt:{emoji:'\u{1f4b8}',cn:{title:'\u{1f4b8}");
c = c.replace("revolt:{cn:{title:'\u{1f525}", "revolt:{emoji:'\u{1f525}',cn:{title:'\u{1f525}");
c = c.replace("insane:{cn:{title:'\u{1f300}", "insane:{emoji:'\u{1f300}',cn:{title:'\u{1f300}");
c = c.replace("victory:{cn:{title:'\u{1f3c6}", "victory:{emoji:'\u{1f3c6}',cn:{title:'\u{1f3c6}");

// Update version strings
c = c.replace(/v2\.2 Global/g, 'v3.0 Global');
c = c.replace(/\bv2\.2\b/g, 'v3.0');
c = c.replace(/boss_sim_save/g, 'boss_sim_v3_save');
c = c.replace(/Corporate Overlord Simulator v2\.2/g, 'Corporate Overlord Simulator v3.0');
c = c.replace(/boss-simulator-v2\.html/g, 'boss-simulator-v3.html');

fs.writeFileSync('boss-simulator-v3.html', c, 'utf8');
console.log('Patched OK, size:', c.length);
