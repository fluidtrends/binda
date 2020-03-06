const { getFileExtension } = require('../../utils')

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
  .run('[Binda] Utils')
