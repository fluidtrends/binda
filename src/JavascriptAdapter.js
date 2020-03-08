const ejs = require('ejs')
const stream = require('stream')
const fs = require('fs')
const { getFileExtension, downloadRemoteFile } = require('../utils')

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

    const fileExtension = getFileExtension(javascriptFile.path)

    if (fileExtension !== 'js' && fileExtension !== 'remote') {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT))
      )
    }

    const stringPathSplitted = javascriptFile.path
      ? javascriptFile.path.split('.')
      : ''

    if (fileExtension === 'remote') {
      javascriptFile.on('data', chunk => {
        const remoteFileUrl = chunk.toString()
        const fileName = stringPathSplitted[stringPathSplitted.length - 3]
        const fileType = stringPathSplitted[stringPathSplitted.length - 2]

        if (fileType !== 'js') {
          return Promise.reject(
            new Error(
              _.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)
            )
          )
        }

        return downloadRemoteFile(remoteFileUrl, `${fileName}${fileType}`)
      })
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
