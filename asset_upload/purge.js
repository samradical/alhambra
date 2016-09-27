const PURGE = require('@samelie/cloudflare-purge-everything')

PURGE.purge('samradelie@gmail.com',
  '683d1bd0e4886f13b6443b34ea52155cb4952',
  '9980ea0a7dd3a5007e4cc79590528e54',
  (res, err, body)=>{
    console.log(body);
  }
)

PURGE.purge('samradelie@gmail.com',
  '683d1bd0e4886f13b6443b34ea52155cb4952',
  '5e00bd651ef675f7405210915218d7e5',
  (res, err, body)=>{
    console.log(body);
  }
)

PURGE.purge('samradelie@gmail.com',
  '683d1bd0e4886f13b6443b34ea52155cb4952',
  '8f95cb2503f1caa04ed4b63aacb7281c',
  (res, err, body)=>{
    console.log(body);
  }
)
