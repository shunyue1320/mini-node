const fs = require('fs')
const EventEmitter = require('events')

class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super()
    this.path = path
    this.flags = options.flags || 'r'
    this.encoding = options.encoding || null
    this.emitClose = options.emitClose || false
    this.start = options.start || 0
    this.end = options.end
    this.highWaterMark = options.highWaterMark || 64 * 1024
    this.open()
    this.flowing = false
    this.on('newListener', type => {
      // events
      if (type == 'data') {
        this.flowing = true
        this.read() // 同步调用read
      }
    })
    this.offset = this.start
  }
  resume() {
    if (!this.flowing) {
      this.flowing = true // 恢复流动模式
      this.read()
    }
  }
  pause() {
    this.flowing = false
  }
  read() {
    if (typeof this.fd !== 'number') {
      return this.once('open', () => this.read())
    }
    const howMuchToRead = this.end ? Math.min(this.end - this.offset + 1, this.highWaterMark) : this.highWaterMark
    let buffer = Buffer.alloc(howMuchToRead)
    fs.read(this.fd, buffer, 0, buffer.length, this.offset, (err, bytesRead) => {
      if (bytesRead) {
        // 我们预期的buffer是100个字节 但是真实读取到的只有6个
        this.emit('data', buffer.slice(0, bytesRead))
        this.offset += bytesRead
        if (this.flowing) {
          this.read()
        }
      } else {
        this.emit('end')
        this.destroy()
      }
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
  open() {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) return this.destroy(err)
      this.fd = fd
      this.emit('open', fd)
    })
  }
  pipe(ws) {
    this.on('data', data => {
      let flag = ws.write(data)
      if (!flag) {
        this.pause()
      }
    })
    this.on('end', () => {
      ws.end() // 已经写入完毕了
    })
    ws.on('drain', () => {
      this.resume()
    })
  }
}

module.exports = ReadStream
