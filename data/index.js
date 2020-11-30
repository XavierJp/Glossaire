(function() {
  const sources = new Set();
  const el = [];

  const fs = require('fs');
  const data = fs.readFileSync('./data/sigles.csv', {
    encoding: 'utf8',
    flag: 'r',
  });
  data.split('\n').forEach((line, index) => {
    const cells = line.split(',');
    const key = cells[2] + cells[3];
    sources.add(key);
    el.push([cells[0], cells[1]]);
  });

  fs.writeFileSync('./data/sigles.json', el, {
    encoding: 'utf8',
    flag: 'w',
  });

  console.log(sources.size);
})();
