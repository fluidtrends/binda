/* eslint-disable no-unused-expressions */

const savor = require('savor')
const { ImageAdapter } = require('../..')
const stream = require('stream')

savor
  .add(
    'should load a path given an uri and fileName',
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
  .add(
    'should load a path given an uri and fileName',
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
