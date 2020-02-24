/* eslint-disable no-unused-expressions */
const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { FileAdapter } = require('../..')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'fileAdapter'
    }
    const file = new FileAdapter(newProps)

    context.expect(file.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const file = new FileAdapter()
      const fileToProcess = 'file'

      const expectedMessage = FileAdapter.ERRORS.CANNOT_PROCESS(
        FileAdapter.MESSAGES.WRONG_FILE_FORMAT
      )

      savor.promiseShouldFail(file.process(fileToProcess), done, error => {
        context.expect(error.message).to.equal(expectedMessage)
      })
    }
  )

  .add(
    'should return a stream given file as a stream',
    async (context, done) => {
      const file = new FileAdapter()
      savor.addAsset('assets/hello.png', 'hello.png', context)

      const assetFileStream = fs.createReadStream(
        path.resolve(context.dir, 'hello.png')
      )

      const returnedFileStream = await file.process(assetFileStream)

      context.expect(returnedFileStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedFileStream._writableState).to.be.a('object')
      context.expect(returnedFileStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given REMOTE image as a stream (image taken from assets)',
    async (context, done) => {
      const file = new FileAdapter()
      savor.addAsset('assets/logo.png.remote', 'logo.png.remote', context)

      const assetFileStream = fs.createReadStream(
        path.resolve(context.dir, 'logo.png.remote')
      )

      const returnedFileStream = await file.process(assetFileStream)

      context.expect(returnedFileStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedFileStream._writableState).to.be.a('object')
      context.expect(returnedFileStream.writable).to.be.true

      done()
    }
  )

  .run('[Binda] File Adapter')
