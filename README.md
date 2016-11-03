#THE ALHAMBRA PROJECT WALKING TOUR

This was for a live event.

[The Alhambra Project](rad.wtf/projects/alhambra)

Can be played online [here](rad.wtf/projects/alhambra)
<hr>

`frontend/webpack.config.js` ENV_VARS has the important app variables. Notably where the assets are saved.

This project is the wrapper site around `@samelie/deriveur` which is the Web Audio geolocation side.

Clone [this repo](https://github.com/samelie/deriveur) into `node_modules/@samelie/`

<hr>


![](https://66.media.tumblr.com/dfffb0f843af048fc379be0442a7fc59/tumblr_og1k8u0zbG1vjlpqwo1_1280.jpg)


###Adding new assets

The assets that go up are in `www-assets`

![](https://66.media.tumblr.com/eaf3405a5b3497bed1230d183da824b5/tumblr_og1lcqUOQ11vjlpqwo1_1280.png)

####audio

`cd assets_preconverted`

`npm i`

Raw assets go in `asset_preperation/_preconverted`

Convert and copy to the google-cloudstorage folder:

`node convert-preconverted.js`

`node prepare_upload.js --force` (force copys over existing items on the cloud)

####images sequences

Raw assets go in `asset_preperation/sequence`

`node  copy_all_to_www-assets.js`



