const marked = require('marked')
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

  process(template, options = {}) {
    if (!(template instanceof stream.Stream)) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_MARKDOWN_FORMAT))
      )
    }

    const fileExtension = getFileExtension(template.path)

    if (fileExtension !== 'md' && fileExtension !== 'remote') {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT))
      )
    }

    const stringPathSplitted = template.path ? template.path.split('.') : ''

    if (fileExtension === 'remote') {
      template.on('data', chunk => {
        const remoteFileUrl = chunk.toString()
        const fileName = stringPathSplitted[stringPathSplitted.length - 3]
        const fileType = stringPathSplitted[stringPathSplitted.length - 2]

        if (fileType !== 'md') {
          return Promise.reject(
            new Error(
              _.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)
            )
          )
        }

        return downloadRemoteFile(remoteFileUrl, `${fileName}${fileType}`)
      })
    }

    let markdownData = ''

    return new Promise((resolve, reject) => {
      try {
        template.on('data', chunk => {
          markdownData = chunk.toString()

          const htmlOutput = marked(markdownData, options)

          try {
            const outputStream = fs.createWriteStream(template.path)

            outputStream.write(htmlOutput)

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
      ? `Cannot process markdown because ${reason}`
      : `Cannot process markdown`
}

_.MESSAGES = {
  WRONG_MARKDOWN_FORMAT: 'wrong markdown format. Expected a stream',
  WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an markdown file'
}

module.exports = _
