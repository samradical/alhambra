require('shelljs/global')

exec('./node_modules/json-dir-listing/bin/index.js  ../www-assets/tour/ -o ../alhambra_data.json')

exec('cp ../www-assets/alhambra_data.json ../frontend/dist/assets/json')
