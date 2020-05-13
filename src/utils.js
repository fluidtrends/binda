const fs = require('fs')
const request = require('request')

const getFileExtension = filePath => {
  if (typeof filePath !== 'string') {
    throw new Error('Expected filePath to be a string.')
  }
  const pathSplit = filePath.split('.')
  return pathSplit[pathSplit.length - 1]
}

const downloadRemoteFile = (url, fileName) => {
  if (!fileName) {
    return Promise.reject(
      new Error('Cannot load file because fileName is a required argument')
    )
  }

  if (!url) {
    return Promise.reject(
      new Error('Cannot load file because url is a required argument')
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

module.exports = {
  getFileExtension,
  downloadRemoteFile
}
