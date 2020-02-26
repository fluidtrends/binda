const fs = require('fs')
const ejs = require('ejs')
const stream = require('stream')

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

    let templateData = ''

    return new Promise((resolve, reject) => {
      try {
        template.on('data', chunk => {
          templateData = chunk.toString()

          const compiledTemplate = ejs.compile(templateData)

          // Finally, let's see if we can validate it
          const output = compiledTemplate(data)

          const writeableTemplate = stream.Writable()

          writeableTemplate.data = output

          resolve(writeableTemplate)
        })
      } catch (error) {
        reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)))
      }
    })
  }
}

_.ERRORS = {
  CANNOT_LOAD: reason =>
    reason ? `Cannot load template because ${reason}` : `Cannot load template`,
  CANNOT_PROCESS: reason =>
    reason
      ? `Cannot process template because ${reason}`
      : `Cannot process template`
}

_.MESSAGES = {
  NO_TEMPLATE: 'no template retrieved',
  BAD_STATUS_CODE: 'the url returned a error code',
  WRONG_TEMPLATE_FORMAT: 'wrong format template. Expected a stream'
}

module.exports = _
