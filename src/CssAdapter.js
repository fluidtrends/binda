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

  process(cssFile, options = {}, data = {}) {
    if (!(cssFile instanceof stream.Stream)) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_HTML_FORMAT))
      )
    }

    if (getFileExtension(cssFile.path) !== 'css') {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT))
      )
    }

    let cssData = ''

    return new Promise((resolve, reject) => {
      try {
        cssFile.on('data', chunk => {
          cssData = chunk.toString()

          const compiledCss = ejs.compile(cssData, options)

          const output = compiledCss(data)

          const writeableCssFile = stream.Writable()

          try {
            const outputStream = fs.createWriteStream(cssFile.path)

            outputStream.write(output)

            resolve(outputStream)
          } catch (error) {
            reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)))
          }

          writeableCssFile.data = output
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
      ? `Cannot process css file because ${reason}`
      : `Cannot process css file`
}

_.MESSAGES = {
  WRONG_HTML_FORMAT: 'wrong css file format. Expected a stream',
  WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an css file'
}

module.exports = _
