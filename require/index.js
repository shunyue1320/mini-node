const fs = require('fs')
const vm = require('vm')
const path = require('path')

function Module(id) {
  this.id = id
  this.exports = {}
  this.parent = {}
}

Module._extensions = {
  '.js'(module) {
    const content = fs.readFileSync(module.id, 'utf8')
    // https://nodejs.org/api/vm.html#vmcompilefunctioncode-params-options
    // vm.compileFunction 作用：将字符串包装成函数 好处：沙箱，不污染全局
    const wrapperFn = vm.compileFunction(content, ['exports', 'require', 'module', '__filename', '__dirname'])

    const exports = this.exports
    const thisValue = exports
    const require = myRequire
    const filename = module.id
    const dirname = path.dirname(filename)

    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/apply
    // Reflect.apply(执行的函数，this指向，参数) 作用：设置函数this指向并传递参数执行该函数
    Reflect.apply(wrapperFn, thisValue, [exports, require, module, filename, dirname])
  },
  '.json'(module) {
    const filename = module.id
    const content = fs.readFileSync(filename, 'utf8')
    try {
      module.exports = JSON.parse(content)
    } catch (err) {
      throw new Error('Cannot find module:' + err.message)
    }
  }
}

Module._resolveFilename = function (id) {
  const filepath = path.resolve(id)
  if (fs.existsSync(filepath)) {
    return filepath
  }
  const extensionKeys = Object.keys(Module._extensions)
  for (let i = 0; i < extensionKeys.length; i++) {
    const path = filepath + extensionKeys[i]
    if (fs.existsSync(path)) {
      return path
    }
  }
  throw new Error('Cannot find module:' + id)
}

Module.prototype.load = function (filename) {
  const ext = path.extname(filename)
  // this = { id, exports }
  Module._extensions[ext](this)
}

function myRequire(id) {
  const filepath = Module._resolveFilename(id)
  const module = new Module(filepath)
  module.load(filepath)

  return module.exports
}

module.exports = {
  myRequire,
  default: myRequire
}
