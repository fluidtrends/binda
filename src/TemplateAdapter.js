const fs = require('fs')
const ejs = require('ejs')
const request = require('request')
const stream = require('stream')

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
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_TEMPLATE_FORMAT))
      )
    }

    const compiledTemplate = ejs.compile(template.data, {})

    // Finally, let's see if we can validate it
    const output = compiledTemplate(args)

    const writeableTemplate = stream.Writable()

    writeableTemplate.data = output

    return new Promise((resolve, reject) => {
      try {
        resolve(template.pipe(writeableTemplate))
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
