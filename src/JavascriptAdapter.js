const ejs = require('ejs')
const stream = require('stream')
const fs = require('fs')
const { getFileExtension } = require('../utils')

class _ {
  constructor(props) {
    this._props = { ...props, ...{} }
  }

  get props() {
    return this._props
  }

  process(javascriptFile, options = {}, data = {}) {
    if (!(javascriptFile instanceof stream.Stream)) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_JAVASCRIPT_FORMAT))
      )
    }

    if (getFileExtension(javascriptFile.path) !== 'js') {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT))
      )
    }

    let javascriptData = ''

    return new Promise((resolve, reject) => {
      try {
        javascriptFile.on('data', chunk => {
          javascriptData = chunk.toString()

          const compiledJavascript = ejs.compile(javascriptData, options)

          const output = compiledJavascript(data)

          try {
            const outputStream = fs.createWriteStream(javascriptFile.path)

            outputStream.write(output)

            resolve(outputStream)
          } catch (error) {
            reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)))
          }
        })
      } catch (error) {
        reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)))
      }
    })
  }
}

_.ERRORS = {
  CANNOT_PROCESS: reason =>
    reason
      ? `Cannot process javascript file because ${reason}`
      : `Cannot process javascript file`
}

_.MESSAGES = {
  WRONG_JAVASCRIPT_FORMAT: 'wrong javascript file format. Expected a stream',
  WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an javascript file'
}

module.exports = _
