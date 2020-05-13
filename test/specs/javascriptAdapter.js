const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { JavascriptAdapter } = require('../../src')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'javascriptAdapter'
    }
    const javascript = new JavascriptAdapter(newProps)

    context.expect(javascript.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const javascript = new JavascriptAdapter()
      const javascriptFileToProcess = 'javascript'

      const expectedMessage = JavascriptAdapter.ERRORS.CANNOT_PROCESS(
        JavascriptAdapter.MESSAGES.WRONG_JAVASCRIPT_FORMAT
      )

      savor.promiseShouldFail(
        javascript.process(javascriptFileToProcess),
        done,
        error => {
          context.expect(error.message).to.equal(expectedMessage)
        }
      )
    }
  )

  .add(
    'should throw an error given a wrong file type to process',
    (context, done) => {
      const javascript = new JavascriptAdapter()

      savor.addAsset('assets/test.html', 'test.html', context)

      const assetHtmlStream = fs.createReadStream(
        path.resolve(context.dir, 'test.html')
      )

      const expectedMessage = JavascriptAdapter.ERRORS.CANNOT_PROCESS(
        JavascriptAdapter.MESSAGES.WRONG_EXTENSION_FORMAT
      )

      savor.promiseShouldFail(
        javascript.process(assetHtmlStream),
        done,
        error => {
          context.expect(error.message).to.equal(expectedMessage)
        }
      )
    }
  )

  .add(
    'should return a stream given REMOTE file as a stream (file taken from assets)',
    async (context, done) => {
      const javascript = new JavascriptAdapter()
      savor.addAsset('assets/test.js.remote', 'test.js.remote', context)

      const assetFileStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js.remote')
      )

      const returnedFileStream = await javascript.process(assetFileStream)

      context.expect(returnedFileStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedFileStream._writableState).to.be.a('object')
      context.expect(returnedFileStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given template as a stream (template taken from assets)',
    async (context, done) => {
      const javascript = new JavascriptAdapter()
      savor.addAsset('assets/test.js', 'test.js', context)

      const assetJavascriptStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js')
      )

      const returnedJavascriptStream = await javascript.process(
        assetJavascriptStream,
        {},
        {}
      )

      context
        .expect(returnedJavascriptStream)
        .to.be.an.instanceOf(stream.Stream)
      context.expect(returnedJavascriptStream._writableState).to.be.a('object')
      context.expect(returnedJavascriptStream.writable).to.be.true
      done()
    }
  )

  .run('[Binda] Javascript Adapter')
