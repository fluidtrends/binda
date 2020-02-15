const fs = require('fs')
const request = require('request')
const path = require('path')

class _ {
  constructor(props) {
    this._props = { ...props, ...{} }
  }

  get props() {
    return this._props
  }

  download(url, fileName) {
    if (!fileName) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_LOAD('fileName is a required argument'))
      )
    }

    if (!url) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_LOAD('url is a required argument'))
      )
    }

    return new Promise((resolve, reject) => {
      request.head(url, (err, res, body) => {
        if (res.statusCode !== 200) {
          reject(new Error(_.ERRORS.CANNOT_LOAD(_.MESSAGES.BAD_STATUS_CODE)))
        }
        resolve(request(url).pipe(fs.createWriteStream(fileName)))
      })
    })
  }
}

_.ERRORS = {
  CANNOT_LOAD: reason =>
    reason ? `Cannot load image because ${reason}` : `Cannot load image`
}

_.MESSAGES = {
  NO_IMAGE: 'no image retrieved',
  BAD_STATUS_CODE: 'the url returned a error code'
}

module.exports = _
