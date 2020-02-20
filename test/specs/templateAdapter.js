const savor = require('savor')
const { TemplateAdapter } = require('../..')
const stream = require('stream')

savor

  .add('should assign correct props', (context, done) => {
    const newProps = {
      name: 'imgAdapter'
    }
    const template = new TemplateAdapter(newProps)

    context.expect(template.props).to.deep.equal(newProps)

    done()
  })

  .add(
    'should return a stream given template as a stream',
    async (context, done) => {
      const template = new TemplateAdapter()
      const mockedTemplateStream = stream.Readable({
        read() {},
        data: `<% if (locals.username) { %>
          "username": "<%= username %>",
      <% } else { %>
          "username": "hello",
      <% } %>
      "test": "test1234",
      "info": "<%= info %>",
      "description": <% if (locals.description) { %> "<%= description %>"
                     <% } else { %> "default" <% } %>`
      })

      const returnedTemplateStream = await template.process(
        mockedTemplateStream
      )
      context.expect(returnedTemplateStream).to.be.an.instanceOf(stream.Stream)
      context.expect(returnedTemplateStream.writable).to.be.true
      context.expect(returnedTemplateStream._writableState).to.be.a('object')

      done()
    }
  )

  .run('[Binda] Template Adapter')
