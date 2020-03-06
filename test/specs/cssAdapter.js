const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { CssAdapter } = require('../..')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'cssAdapter'
    }
    const css = new CssAdapter(newProps)

    context.expect(css.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const css = new CssAdapter()
      const cssFileToProcess = 'css'

      const expectedMessage = CssAdapter.ERRORS.CANNOT_PROCESS(
        CssAdapter.MESSAGES.WRONG_HTML_FORMAT
      )

      savor.promiseShouldFail(css.process(cssFileToProcess), done, error => {
        context.expect(error.message).to.equal(expectedMessage)
      })
    }
  )

  .add(
    'should throw an error given a wrong file type to process',
    (context, done) => {
      const css = new CssAdapter()
      savor.addAsset('assets/test.js', 'test.js', context)

      const assetJavascriptStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js')
      )

      const expectedMessage = CssAdapter.ERRORS.CANNOT_PROCESS(
        CssAdapter.MESSAGES.WRONG_EXTENSION_FORMAT
      )

      savor.promiseShouldFail(
        css.process(assetJavascriptStream),
        done,
        error => {
          context.expect(error.message).to.equal(expectedMessage)
        }
      )
    }
  )

  .add(
    'should return a stream given template as a stream (template taken from assets)',
    async (context, done) => {
      const css = new CssAdapter()
      savor.addAsset('assets/test.css', 'test.css', context)

      const assetCssStream = fs.createReadStream(
        path.resolve(context.dir, 'test.css')
      )

      const returnedCssStream = await css.process(assetCssStream, {}, {})

      context.expect(returnedCssStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedCssStream._writableState).to.be.a('object')
      context.expect(returnedCssStream.writable).to.be.true
      done()
    }
  )

  .run('[Binda] Css Adapter')
