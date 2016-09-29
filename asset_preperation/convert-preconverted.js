require('shelljs/global')
exec('node prepare_upload.js --convertSplited')
exec('node prepare_upload.js --deleteWavs')
exec('node prepare_upload.js --copy')


