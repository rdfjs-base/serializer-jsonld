const concatStream = require('concat-stream')

module.exports = function waitForContent (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(concatStream(content => resolve(content)))

    stream.on('error', err => reject(err))
  })
}
