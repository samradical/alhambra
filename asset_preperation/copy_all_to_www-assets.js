require('shelljs/global')
exec('node png_sequence.js')
exec('node bodymovin-copy.js')
exec('node cover_resize.js')
exec('node generate_json.js')

setTimeout(()=>{
  exec('cp -r ../frontend/dist/assets/ ../www-assets/assets/')
}, 3000)


