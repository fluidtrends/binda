const ejs = require('ejs')
const stream = require('stream')
const fs = require('fs')
const { getFileExtension, downloadRemoteFile } = require('./utils')

class _ {
  constructor(props) {
    this._props = { ...props, ...{} }
  }

  get props() {
    return this._props
  }

  process(htmlFile, options = {}, data = {}) {
    if (!(htmlFile instanceof stream.Stream)) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_HTML_FORMAT))
      )
    }

    const fileExtension = getFileExtension(htmlFile.path)

    if (fileExtension !== 'html' && fileExtension !== 'remote') {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT))
      )
    }

    const stringPathSplitted = htmlFile.path ? htmlFile.path.split('.') : ''

    if (fileExtension === 'remote') {
      htmlFile.on('data', chunk => {
        const remoteFileUrl = chunk.toString()
        const fileName = stringPathSplitted[stringPathSplitted.length - 3]
        const fileType = stringPathSplitted[stringPathSplitted.length - 2]

        if (fileType !== 'html') {
          return Promise.reject(
            new Error(
              _.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)
            )
          )
        }

        return downloadRemoteFile(remoteFileUrl, `${fileName}${fileType}`)
      })
    }

    let htmlData = ''

    return new Promise((resolve, reject) => {
      try {
        htmlFile.on('data', chunk => {
          htmlData = chunk.toString()

          const compiledHtml = ejs.compile(htmlData, options)

          const output = compiledHtml(data)

          try {
            const outputStream = fs.createWriteStream(htmlFile.path)

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
      ? `Cannot process html file because ${reason}`
      : `Cannot process html file`
}

_.MESSAGES = {
  WRONG_HTML_FORMAT: 'wrong html file format. Expected a stream',
  WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an html file'
}

module.exports = _
