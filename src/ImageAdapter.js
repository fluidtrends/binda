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

  get path() {
    return !this.dir || !this.filepath
      ? null
      : path.resolve(this.dir, this.filepath)
  }

  get exists() {
    return this.path && fs.existsSync(path.resolve(this.path))
  }

  download(url, fileName) {
    return new Promise((resolve, reject) => {
      try {
        request.head(url, function(err, res, body) {
          resolve(request(url).pipe(fs.createWriteStream(fileName)))
        })
      } catch (error) {
        reject(new Error(_.ERRORS.CANNOT_LOAD(error.message)))
      }
    })
  }
}

_.ERRORS = {
  CANNOT_LOAD: reason =>
    reason ? `Cannot load image because ${reason}` : `Cannot load image`,
  CANNOT_SAVE: reason =>
    reason ? `Cannot save image because ${reason}` : `Cannot save image`
}

module.exports = _
