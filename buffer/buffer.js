// copy(目标buffer, 目标buffer起点, 当前buffer拷贝起点， 当前buffer拷贝终点)
Buffer.prototype.copy = function (target, targetStart, sourceStart = 0, sourceEnd = this.length) {
  for (let i = 0; i < sourceEnd - sourceStart; i++) {
    target[targetStart + i] = this[sourceStart + i] // buffer中存放的都是引用类型
  }
}

// concat([buffer, buffer], buffer总长度)
Buffer.concat = function (list, totalLength = list.reduce((memo, current) => (memo += current.length), 0, 0)) {
  // 创建一个长为 totalLength 的 Buffer
  const bigBuffer = Buffer.alloc(totalLength)
  let pos = 0
  list.forEach(buf => {
    buf.copy(bigBuffer, pos)
    pos += buf.length
  })

  return bigBuffer
}

// 通过 sep 拆分 Buffer， 类似： '1,1,1,1'.split(',') // ['1', '1', '1', '1']
Buffer.prototype.split = function (sep) {
  sep = Buffer.isBuffer(sep) ? sep : Buffer.from(sep)
  let len = sep.length // 是对应分割符的长度 是以字节为单位的
  const arr = []
  let offset = 0
  let idx = 0
  while (-1 !== (idx = this.indexOf(sep, offset))) {
    arr.push(this.slice(offset, idx))
    offset = idx + len
  }
  arr.push(this.slice(offset))
  return arr
}

module.exports = Buffer
