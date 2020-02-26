const fs = require('fs')
const stream = require('stream')

const ImageAdapter = require('./ImageAdapter')

class _ {
  constructor(props) {
    this._props = { ...props, ...{} }
  }

  get props() {
    return this._props
  }

  get type() {
    return this._type || _.TYPES.ASSET
  }

  detectType(fileStream) {
    if (this._type) {
      // Not necessary
      return
    }

    // Figure out the file's extension
    const stringPathSplit = fileStream.path ? fileStream.path.split('.') : ''

    let fileExtension = stringPathSplit[
      stringPathSplit.length - 1
    ].toUpperCase()

    fileExtension =
      fileExtension === 'REMOTE'
        ? stringPathSplit[stringPathSplit.length - 2].toUpperCase()
        : fileExtension

    for (let [type, values] of Object.entries(_.TYPES)) {
      if (values.includes(fileExtension)) {
        // Looks like we recognize this type
        this._type = type
        return
      }
    }
  }

  get isCompilable() {
    return !_.NONCOMPILABLE_TYPES.includes(this.type)
  }

  process(fileStream) {
    if (
      !(fileStream instanceof stream.Stream) ||
      !fileStream.readable ||
      !(typeof fileStream._readableState === 'object')
    ) {
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_FILE_FORMAT))
      )
    }

    // assign the file type
    this.detectType(fileStream)

    if (!this.isCompilable) {
      // specific type not implemented yet
      return Promise.reject(
        new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.NO_COMPATIBLE_TYPE))
      )
    }

    return new Promise((resolve, reject) => {
      try {
        if (this.type === 'IMAGE') {
          const imageAdapter = new ImageAdapter()
          resolve(imageAdapter.process(fileStream))
        }
      } catch (error) {
        reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)))
      }
    })
  }
}

_.ERRORS = {
  CANNOT_PROCESS: reason =>
    reason ? `Cannot process file because ${reason}` : `Cannot load file`
}

_.TYPES = {
  ASSET: 'ASSET_TYPE',
  IMAGE: ['PNG', 'JPG', 'JPEG', 'GIF', 'SVG'],
  JSON: ['JSON'],
  JAVASCRIPT: ['JS'],
  CSS: ['CSS'],
  MARKDOWN: ['MD']
}

_.NONCOMPILABLE_TYPES = [
  _.TYPES.JSON,
  _.TYPES.JAVASCRIPT,
  _.TYPES.CSS,
  _.TYPES.MARKDOWN
]

_.MESSAGES = {
  WRONG_FILE_FORMAT: 'wrong file format. Expected a ReadAble Stream.',
  NO_COMPATIBLE_TYPE:
    'no compatible type to process yet. You can help us by submitting a PR to: https://github.com/fluidtrends/binda'
}

module.exports = _
