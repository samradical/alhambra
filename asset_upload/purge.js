const PURGE = require('@samelie/cloudflare-purge-everything')

PURGE.purge('samradelie@gmail.com',
  '683d1bd0e4886f13b6443b34ea52155cb4952',
  '9980ea0a7dd3a5007e4cc79590528e54',
  (res, err, body)=>{
    console.log(body);
  }
)
