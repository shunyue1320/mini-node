function EventEmitter() {
  this._events = {}
}

EventEmitter.prototype.on = function (eventName, callback) {
  if (!this._events) {
    this._events = {}
  }

  if (eventName !== 'newListener') {
    this.emit('newListener', eventName)
  }

  this._events[eventName] = this._events[eventName] || []
  this._events[eventName].push(callback)
}

EventEmitter.prototype.off = function (eventName, callback) {
  if (!this._events) {
    this._events = {}
  }

  const callbacks = this._events[eventName]
  if (callbacks) {
    callbacks
      .slice()
      .reverse()
      .some((item, index) => {
        if (item === callback || item.l === callback) {
          this._events[eventName].splice(callbacks.length - 1 - index, 1)
          return true
        }
      })
  }
}

EventEmitter.prototype.once = function (eventName, callback) {
  const once = (...args) => {
    callback(...args)
    this.off(eventName, once)
  }
  once.l = callback
  this.on(eventName, once)
}

EventEmitter.prototype.emit = function (eventName, ...args) {
  if (!this._events) {
    this._events = {}
  }

  const callbacks = this._events[eventName]
  if (callbacks) {
    callbacks.forEach(callback => {
      callback(...args)
    })
  }
}

module.exports = EventEmitter
