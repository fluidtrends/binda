const { getFileExtension, downloadRemoteFile } = require('../../src/utils')

const savor = require('savor')

savor
  .add('should return the right extension', (context, done) => {
    const testString = 'file.html'

    const extension = getFileExtension(testString)
    const expectedExtension = 'html'

    context.expect(extension).to.equal(expectedExtension)

    done()
  })
  .add('should return an error', (context, done) => {
    const testArr = []

    const expectedError = 'Expected filePath to be a string.'

    context.expect(() => getFileExtension(testArr)).to.throw(expectedError)

    done()
  })

  .add('should throw an error given an invalid url', (context, done) => {
    const url = ''
    const fileName = 'logo.png'

    const expectedMessage =
      'Cannot load file because url is a required argument'

    savor.promiseShouldFail(downloadRemoteFile(url, fileName), done, error => {
      context.expect(error.message).to.equal(expectedMessage)
    })
  })

  .add('should throw an error given an invalid fileName', (context, done) => {
    const url =
      'https://raw.githubusercontent.com/fluidtrends/binda/master/logo.png'
    const fileName = ''

    const expectedMessage =
      'Cannot load file because fileName is a required argument'

    savor.promiseShouldFail(downloadRemoteFile(url, fileName), done, error => {
      context.expect(error.message).to.equal(expectedMessage)
    })
  })

  .run('[Binda] Utils')
