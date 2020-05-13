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

  process(template, options = {}, data = {}) {
    if (!(template instanceof stream.Stream)) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_TEMPLATE_FORMAT))
      )
    }

    const fileExtension = getFileExtension(template.path)
    const stringPathSplitted = template.path ? template.path.split('.') : ''

    if (fileExtension === 'remote') {
      template.on('data', chunk => {
        const remoteFileUrl = chunk.toString()
        const fileName = stringPathSplitted[stringPathSplitted.length - 3]
        const fileType = stringPathSplitted[stringPathSplitted.length - 2]

        return downloadRemoteFile(remoteFileUrl, `${fileName}${fileType}`)
      })
    }

    let templateData = ''

    return new Promise((resolve, reject) => {
      try {
        template.on('data', chunk => {
          templateData = chunk.toString()

          const compiledTemplate = ejs.compile(templateData, options)

          const output = compiledTemplate(data)

          try {
            const outputStream = fs.createWriteStream(template.path)

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
      ? `Cannot process template because ${reason}`
      : `Cannot process template`
}

_.MESSAGES = {
  WRONG_TEMPLATE_FORMAT: 'wrong template format. Expected a stream'
}

module.exports = _
