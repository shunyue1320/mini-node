const fs = require('fs')
const path = require('path')
const ReadStream = require('../../buffer/ReadStream')
const WriteStream = require('../../buffer/WriteStream')

let rs = fs.createReadStream(path.resolve(__dirname, '../../README.md'), {
  highWaterMark: 4 // 每次读取4个
})
let ws = fs.createWriteStream(path.resolve(__dirname, '../../README_COPY.md'), {
  //  createWriteStream 有缓存的概念
  highWaterMark: 1 // 我期望使用一个字节的内存大小来控制
})

// let rs = new ReadStream(path.resolve(__dirname, '../../README.md'), {
//   highWaterMark: 4
// })
// let ws = new WriteStream(path.resolve(__dirname, '../../README_COPY.md'), {
//   highWaterMark: 1
// })

rs.pipe(ws) // 看不到写入的过程， 此方法是异步的方法
