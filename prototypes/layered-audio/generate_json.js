require('shelljs/global')

exec('./node_modules/json-dir-listing/bin/index.js  assets/cecil -o ../json/cecil.json')
exec('./node_modules/json-dir-listing/bin/index.js  assets/sam -o ../json/sam.json')
exec('./node_modules/json-dir-listing/bin/index.js  assets/music -o ../json/music.json')
exec('./node_modules/json-dir-listing/bin/index.js  assets/effects/water -o ../../json/water.json')
