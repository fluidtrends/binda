const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { HtmlAdapter } = require('../../src')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'htmlAdapter'
    }
    const html = new HtmlAdapter(newProps)

    context.expect(html.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const html = new HtmlAdapter()
      const htmlFileToProcess = 'html'

      const expectedMessage = HtmlAdapter.ERRORS.CANNOT_PROCESS(
        HtmlAdapter.MESSAGES.WRONG_HTML_FORMAT
      )

      savor.promiseShouldFail(html.process(htmlFileToProcess), done, error => {
        context.expect(error.message).to.equal(expectedMessage)
      })
    }
  )

  .add(
    'should throw an error given a wrong file type to process',
    (context, done) => {
      const html = new HtmlAdapter()
      savor.addAsset('assets/test.js', 'test.js', context)

      const assetJavascriptStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js')
      )

      const expectedMessage = HtmlAdapter.ERRORS.CANNOT_PROCESS(
        HtmlAdapter.MESSAGES.WRONG_EXTENSION_FORMAT
      )

      savor.promiseShouldFail(
        html.process(assetJavascriptStream),
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
      const html = new HtmlAdapter()
      savor.addAsset('assets/test.html.remote', 'test.html.remote', context)

      const assetFileStream = fs.createReadStream(
        path.resolve(context.dir, 'test.html.remote')
      )

      const returnedFileStream = await html.process(assetFileStream)

      context.expect(returnedFileStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedFileStream._writableState).to.be.a('object')
      context.expect(returnedFileStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given template as a stream (template taken from assets)',
    async (context, done) => {
      const html = new HtmlAdapter()
      savor.addAsset('assets/test.html', 'test.html', context)

      const assetHtmlStream = fs.createReadStream(
        path.resolve(context.dir, 'test.html')
      )

      const returnedHtmlStream = await html.process(assetHtmlStream, {}, {})

      context.expect(returnedHtmlStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedHtmlStream._writableState).to.be.a('object')
      context.expect(returnedHtmlStream.writable).to.be.true
      done()
    }
  )

  .run('[Binda] Html Adapter')
