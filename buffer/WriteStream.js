const fs = require('fs')
const EventEmitter = require('events')

class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    this.path = path
    this.flags = options.flags
    this.encoding = options.encoding || 'utf8'
    this.mode = options.mode || 438
    this.start = options.start || 0
    this.highWaterMark = options.highWaterMark || 16 * 1024

    this.len = 0 // 维护写入的个数和长度
    this.writing = false // 是否正在写入来区分放到缓存区还是写入文件中
    this.cache = [] // 用于缓存除了第一次写入的逻辑
    this.needDrain = false // 是否要触发drain事件
    this.offset = this.start // 写入的偏移量
    this.open()
  }
  open() {
    fs.open(this.path, this.flags, this.mode, (error, fd) => {
      if (error) return this.destroy(error)
      this.fd = fd
      this.emit('open', fd)
    })
  }
  end(chunk = '', encoding = this.encoding, callback = () => {}) {
    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    this.write(chunk, encoding, () => {
      this.needDrain = false
      callback()
    })
  }
  write(chunk, encoding = this.encoding, callback = () => {}) {
    // 统一写入的数据格式
    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    this.len += chunk.length
    let returnValue = this.len < this.highWaterMark
    this.needDrain = !returnValue // 如果写入的数据达到了预期才应该触发needDrain
    const clear = () => {
      this.clearBuffer()
      callback()
    }
    if (this.writing) {
      // 向缓存中写入
      this.cache.push({
        chunk,
        encoding,
        callback: clear
      }) // 多个异步同时操作 可以采用队列的方式来记录
    } else {
      this.writing = true
      this._write(chunk, encoding, clear)
    }
    return returnValue
  }
  clearBuffer() {
    let cur = this.cache.shift() // 在队列中拿出第一个
    if (cur) {
      this._write(cur.chunk, cur.encoding, cur.callback)
    } else {
      // 是否要触发drain事件
      this.writing = false // 触发drain的时候 下次写入可以在向文件中继续写入
      if (this.needDrain) {
        this.needDrain = false
        this.emit('drain')
      }
    }
  }
  _write(chunk, encoding, callback) {
    // 调用fs.write写入
    if (typeof this.fd !== 'number') {
      return this.once('open', () => this._write(chunk, encoding, callback))
    }
    fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, written) => {
      this.len -= written // 写入后 减少正在写入的个数
      this.offset += written
      callback()
    })
  }
  destroy(err) {
    if (err) {
      this.emit('error', err)
    }
    if (this.fd) {
      fs.close(this.fd, () => {
        if (this.emitClose) {
          this.emit('close')
        }
      })
    }
  }
}

module.exports = WriteStream
