const path = require('path')

const myRequire = require('../../require').default
const textjosn = myRequire(path.resolve(__dirname, './textjosn'))
const textjs = myRequire(path.resolve(__dirname, './textjs'))
console.log('a + b = ', textjosn.a + textjs.b)
