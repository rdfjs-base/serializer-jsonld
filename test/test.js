/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const sinkTest = require('rdf-sink/test')
const Readable = require('readable-stream')
const JsonLdSerializer = require('..')

describe('rdf-serializer-jsonld', () => {
  sinkTest(JsonLdSerializer, {readable: true})

  it('should serialize incoming quads', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object'),
      rdf.namedNode('http://example.org/graph')
    )

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }]

    let input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    let serializer = new JsonLdSerializer()
    let stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })
})
