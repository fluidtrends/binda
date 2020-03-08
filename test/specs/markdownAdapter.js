const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { MarkdownAdapter } = require('../..')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'markdownAdapter'
    }
    const markdown = new MarkdownAdapter(newProps)

    context.expect(markdown.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const markdown = new MarkdownAdapter()
      const templateToProcess = 'markdown'

      const expectedMessage = MarkdownAdapter.ERRORS.CANNOT_PROCESS(
        MarkdownAdapter.MESSAGES.WRONG_MARKDOWN_FORMAT
      )

      savor.promiseShouldFail(
        markdown.process(templateToProcess),
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
      const markdown = new MarkdownAdapter()

      savor.addAsset('assets/test.js', 'test.js', context)

      const assetJavascriptStream = fs.createReadStream(
        path.resolve(context.dir, 'test.js')
      )

      const expectedMessage = MarkdownAdapter.ERRORS.CANNOT_PROCESS(
        MarkdownAdapter.MESSAGES.WRONG_EXTENSION_FORMAT
      )

      savor.promiseShouldFail(
        markdown.process(assetJavascriptStream),
        done,
        error => {
          context.expect(error.message).to.equal(expectedMessage)
        }
      )
    }
  )

  .add(
    'should return a stream given markdown as a stream (markdown taken from assets)',
    async (context, done) => {
      const markdown = new MarkdownAdapter()
      savor.addAsset('assets/test.md', 'test.md', context)

      const assetMarkdownStream = fs.createReadStream(
        path.resolve(context.dir, 'test.md')
      )

      const expectedHtml = `<h1 id="hello">Hello</h1>\n<p>This is a random text</p>\n`

      const returnedHtmlStream = await markdown.process(assetMarkdownStream)

      context.expect(returnedHtmlStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedHtmlStream._writableState).to.be.a('object')
      context.expect(returnedHtmlStream.writable).to.be.true
      done()
    }
  )

  .add(
    'should return a stream given REMOTE file as a stream (file taken from assets)',
    async (context, done) => {
      const markdown = new MarkdownAdapter()
      savor.addAsset('assets/test.md.remote', 'test.md.remote', context)

      const assetFileStream = fs.createReadStream(
        path.resolve(context.dir, 'test.md.remote')
      )

      const returnedFileStream = await markdown.process(assetFileStream)

      context.expect(returnedFileStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedFileStream._writableState).to.be.a('object')
      context.expect(returnedFileStream.writable).to.be.true

      done()
    }
  )

  .add(
    'should return a stream given markdown as a stream (markdown taken from assets) - with OPTIONS',
    async (context, done) => {
      const markdown = new MarkdownAdapter()
      savor.addAsset('assets/test.md', 'test.md', context)

      const assetMarkdownStream = fs.createReadStream(
        path.resolve(context.dir, 'test.md')
      )

      const customOptions = {
        headerPrefix: 'test'
      }

      const expectedHtml = `<h1 id="${customOptions.headerPrefix}hello">Hello</h1>\n<p>This is a random text</p>\n`

      const returnedHtmlStream = await markdown.process(
        assetMarkdownStream,
        customOptions
      )

      context.expect(returnedHtmlStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedHtmlStream._writableState).to.be.a('object')
      context.expect(returnedHtmlStream.writable).to.be.true
      done()
    }
  )

  .run('[Binda] Markdown Adapter')
