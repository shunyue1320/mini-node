## 为什么 node 要设计 events 事件机制？

由于传统的方法写代码嵌套太深，不符合从上到下的傻瓜式视觉流程，类似下面这样的代码实在便于维护与阅读，所以 node 就设计出了 events 事件机制。
```js
// 传统的文件拷贝方法 copy(源路径， 目标路径， 捕获错误回调)
function copy(source, target, cb) {
    const BUFFER_SIZE = 3;
    const buffer = Buffer.alloc(BUFFER_SIZE);
    fs.open(source, 'r', function (err, fd) {
        if (err) return cb(err)
        fs.open(target, 'w', function (err, wfd) {
            if (err) return cb(err)
            let readOffset = 0;
            let writeOffset = 0;
            function next() {
                fs.read(fd, buffer, 0, BUFFER_SIZE, readOffset, function (err, bytesRead) {
                    if (err) return cb(err)
                    if (bytesRead == 0) {
                        console.log('copy完整')
                        fs.close(fd, function () { })
                        fs.close(wfd, function () { })
                        return
                    }
                    fs.write(wfd, buffer, 0, bytesRead, writeOffset, function (err, written) {
                        if (err) return cb(err)
                        readOffset += written
                        writeOffset = readOffset
                        next();
                    })
                })
            }
            next()
        })
    })
}
```

## 使用 events 事件机制后：
fs.createReadStream 的事件监听机制就是使用的 events 事件机制
fs 对文件的读取写入操作都是依靠 fs.createReadStream 的事件监听机制就是使用的 events 事件机制实现的，所以 fs 方法写的代码就相对易读
```js
const fs = require('fs')
const path = require('path')
let rs = fs.createReadStream(path.resolve(__dirname, 'README.md'), {
  flags: 'r', // 默认flags就是r 表示读取操作
  encoding: null, // 默认读取出的数据是二进制格式
  emitClose: true, // 读取完毕后是否要触发close事件
  start: 0, // 从哪里开始读取
  end: 50, // 读取到什么位置 （包后 0-3是四个字节）
  highWaterMark: 3 // 每次读取文件的字节数 64*1024
})

// 文件的可读流才具备 open 事件
rs.on('open', function (fd) {
  console.log('open', fd)
})

rs.on('error', function (err) {
  console.log('error', err)
})
let arr = []
rs.on('data', function (data) {
  console.log('data', data)
  arr.push(data)
  // rs.pause()
})
rs.on('end', function () {
  console.log('end', Buffer.concat(arr).toString())
})

```
