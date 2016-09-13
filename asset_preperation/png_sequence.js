require('shelljs/global')
const P = require('@samelie/magipack-structure')
P.start('sequence', 'sequence-out')

exec('cp -r sequence-out ../frontend/dist/assets/')
