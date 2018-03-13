/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const sinkTest = require('rdf-sink/test')
const Readable = require('readable-stream')
const JsonLdSerializer = require('..')

describe('rdf-serializer-jsonld', () => {
  sinkTest(JsonLdSerializer, {readable: true})

  it('should serialize rdf:type', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      rdf.namedNode('http://example.org/type'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      '@type': 'http://example.org/type'
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize blank node subjects', () => {
    const quad = rdf.quad(
      rdf.blankNode(),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object'))

    const jsonld = [{
      '@id': '_:b1',
      'http://example.org/predicate': 'object'
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize named node objects', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.namedNode('http://example.org/object'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize blank node objects', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.blankNode('b1'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@id': '_:b1'
      }
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize a language literal', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object', 'en'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@language': 'en',
        '@value': 'object'
      }
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize a datatype literal', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object', rdf.namedNode('http://example.org/datatype')))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@type': 'http://example.org/datatype',
        '@value': 'object'
      }
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize quads with default graph into object root', () => {
    const quad1 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1'))

    const quad2 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object2'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object2'
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad1)
      input.push(quad2)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })

  it('should serialize quads with named graph into @graph property', () => {
    const quad1 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1'),
      rdf.namedNode('http://example.org/graph'))

    const quad2 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object2'),
      rdf.namedNode('http://example.org/graph'))

    const jsonld = [{
      '@id': 'http://example.org/graph',
      '@graph': {
        '@id': 'http://example.org/subject',
        'http://example.org/predicate': 'object1'
      }
    }, {
      '@id': 'http://example.org/graph',
      '@graph': {
        '@id': 'http://example.org/subject',
        'http://example.org/predicate': 'object2'
      }
    }]

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad1)
      input.push(quad2)
      input.push(null)
    }

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return Promise.resolve().then(() => {
      assert.deepEqual(stream.read(), jsonld)

      return rdf.waitFor(stream)
    })
  })
})
