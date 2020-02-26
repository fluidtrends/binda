const savor = require('savor')
const stream = require('stream')
const fs = require('fs')
const path = require('path')
const { TemplateAdapter } = require('../..')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'templateAdapter'
    }
    const template = new TemplateAdapter(newProps)

    context.expect(template.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should throw an error given a wrong data type to process',
    (context, done) => {
      const template = new TemplateAdapter()
      const templateToProcess = 'template'

      const expectedMessage = TemplateAdapter.ERRORS.CANNOT_PROCESS(
        TemplateAdapter.MESSAGES.WRONG_TEMPLATE_FORMAT
      )

      savor.promiseShouldFail(
        template.process(templateToProcess),
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
      const template = new TemplateAdapter()
      savor.addAsset('assets/template.json', 'template.json', context)

      const assetTemplateStream = fs.createReadStream(
        path.resolve(context.dir, 'template.json')
      )

      const data = {
        description: 'carmel',
        info: '#roadto1mil'
      }

      const returnedTemplateStream = await template.process(
        assetTemplateStream,
        {},
        data
      )
      const streamData = JSON.parse(returnedTemplateStream.data)

      context.expect(returnedTemplateStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedTemplateStream._writableState).to.be.a('object')
      context.expect(returnedTemplateStream.writable).to.be.true
      context.expect(streamData.username).to.be.equal('hello')
      context.expect(streamData.test).to.be.equal('test1234')
      context.expect(streamData.info).to.be.equal('#roadto1mil')
      context.expect(streamData.description).to.be.equal('carmel')
      done()
    }
  )

  .run('[Binda] Template Adapter')
