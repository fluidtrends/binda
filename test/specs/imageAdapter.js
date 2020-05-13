/* eslint-disable no-unused-expressions */

const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { ImageAdapter } = require('../../src')
const { downloadRemoteFile } = require('../../src/utils')

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

  .add(
    'should throw an error given a wrong file type to process',
    (context, done) => {
      const image = new ImageAdapter()
      savor.addAsset('assets/test.js', 'test.js', context)

      const assetJavascriptStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js')
      )

      const expectedMessage = ImageAdapter.ERRORS.CANNOT_PROCESS(
        ImageAdapter.MESSAGES.WRONG_EXTENSION_FORMAT
      )

      savor.promiseShouldFail(
        image.process(assetJavascriptStream),
        done,
        error => {
          context.expect(error.message).to.equal(expectedMessage)
        }
      )
    }
  )

  .add(
    'should return a stream given image as a stream (image taken from assets)',
    async (context, done) => {
      const image = new ImageAdapter()
      savor.addAsset('assets/hello.png', 'hello.png', context)

      const assetImgStream = fs.createReadStream(
        path.resolve(context.dir, 'hello.png')
      )

      const returnedImageStream = await image.process(assetImgStream)

      context.expect(returnedImageStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedImageStream._writableState).to.be.a('object')
      context.expect(returnedImageStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given REMOTE image as a stream (image taken from assets)',
    async (context, done) => {
      const image = new ImageAdapter()
      savor.addAsset('assets/logo.png.remote', 'logo.png.remote', context)

      const assetImgStream = fs.createReadStream(
        path.resolve(context.dir, 'logo.png.remote')
      )

      const returnedImageStream = await image.process(assetImgStream)

      context.expect(returnedImageStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedImageStream._writableState).to.be.a('object')
      context.expect(returnedImageStream.writable).to.be.true

      done()
    }
  )

  .run('[Binda] Image Adapter')
