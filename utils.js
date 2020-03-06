const getFileExtension = filePath => {
  if (typeof filePath !== 'string') {
    throw new Error('Expected filePath to be a string.')
  }
  const pathSplit = filePath.split('.')
  return pathSplit[pathSplit.length - 1]
}

module.exports = {
  getFileExtension
}
