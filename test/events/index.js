// const EventEmitter = require('events')
const EventEmitter = require('../../events')

const event = new EventEmitter()

event.on('newListener', function (type) {
  console.log('用户订阅了事件：', type)
})

function fn1(params) {
  console.log('我是fn1 参数：', params)
}

event.on('aaa', fn1)
event.off('aaa', fn1)
event.on('aaa', fn1)
event.once('aaa', fn1)
event.off('aaa', fn1)

event.emit('aaa')
console.log('------------')
event.emit('aaa')
