/* eslint-disable no-unused-expressions */

const savor = require('savor')
const { ImageAdapter } = require('../..')
const stream = require('stream')
const fs = require('fs')
const util = require('util')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'imgAdapter'
    }
    const image = new ImageAdapter(newProps)

    context.expect(image.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const image = new ImageAdapter()
      const imageToProcess = 'image'

      const expectedMessage = ImageAdapter.ERRORS.CANNOT_PROCESS(
        ImageAdapter.MESSAGES.WRONG_IMAGE_FORMAT
      )

      savor.promiseShouldFail(image.process(imageToProcess), done, error => {
        context.expect(error.message).to.equal(expectedMessage)
      })
    }
  )

  .add('should throw an error given an invalid url', (context, done) => {
    const image = new ImageAdapter()
    const url = ''
    const fileName = 'logo.png'

    const expectedMessage =
      'Cannot load image because url is a required argument'

    savor.promiseShouldFail(image.download(url, fileName), done, error => {
      context.expect(error.message).to.equal(expectedMessage)
    })
  })

  .add('should throw an error given an invalid fileName', (context, done) => {
    const image = new ImageAdapter()
    const url =
      'https://raw.githubusercontent.com/fluidtrends/binda/master/logo.png'
    const fileName = ''

    const expectedMessage =
      'Cannot load image because fileName is a required argument'

    savor.promiseShouldFail(image.download(url, fileName), done, error => {
      context.expect(error.message).to.equal(expectedMessage)
    })
  })

  .add(
    'should throw an error given an invalid url and fileName',
    (context, done) => {
      const image = new ImageAdapter()
      const url = 'https://raw.githubusercontent.com/fluidtrends/binda'
      const fileName = 'logo.png'

      const expectedMessage = ImageAdapter.ERRORS.CANNOT_LOAD(
        ImageAdapter.MESSAGES.BAD_STATUS_CODE
      )

      savor.promiseShouldFail(image.download(url, fileName), done, error => {
        context.expect(error.message).to.equal(expectedMessage)
      })
    }
  )

  .add(
    'should return a stream given image as a stream',
    async (context, done) => {
      const image = new ImageAdapter()
      const mockedImgStream = stream.Readable({
        read() {}
      })
      const returnedImageStream = await image.process(mockedImgStream)

      context.expect(returnedImageStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedImageStream._writableState).to.be.a('object')
      context.expect(returnedImageStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given image as a stream (image taken from assets)',
    async (context, done) => {
      done()
    }
  )

  .add(
    'should return a stream given a valid url and fileName',
    async (context, done) => {
      const image = new ImageAdapter()
      const url =
        'https://raw.githubusercontent.com/fluidtrends/binda/master/logo.png'
      const fileName = 'logo.png'

      const imageAsStream = await image.download(url, fileName)

      context.expect(imageAsStream).to.be.an.instanceOf(stream.Stream)
      context.expect(imageAsStream.path).to.equal(fileName)
      context.expect(imageAsStream._writableState).to.be.a('object')
      context.expect(imageAsStream.writable).to.be.true

      done()
    }
  )

  .run('[Binda] Image Adapter')
