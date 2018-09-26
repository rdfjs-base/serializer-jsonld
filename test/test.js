/* global describe, it */

const assert = require('assert')
const concatStream = require('concat-stream')
const rdf = require('@rdfjs/data-model')
const sinkTest = require('@rdfjs/sink/test')
const Readable = require('readable-stream')
const JsonLdSerializer = require('..')

function expectError (p) {
  return new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
      return p()
    }).then(() => {
      reject(new Error('no error thrown'))
    }).catch(() => {
      resolve()
    })
  })
}

function waitForContent (stream) {
  return new Promise((resolve, reject) => {
    stream.pipe(concatStream(content => resolve(content)))

    stream.on('error', err => reject(err))
  })
}

describe('@rdfjs/serializer-jsonld', () => {
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
    })
  })

  it('should serialize a literal', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    }]

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad1)
        input.push(quad2)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
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

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad1)
        input.push(quad2)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer()
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
    })
  })

  it('should serialize with object encoding if option is given', () => {
    const quad1 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object 1'))

    const quad2 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object 2'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 2'
    }]

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad1)
        input.push(quad2)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer({encoding: 'object'})
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(content, jsonld)
    })
  })

  it('should serialize with string encoding if option is given', () => {
    const quad1 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object 1'))

    const quad2 = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object 2'))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 1'
    }, {
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object 2'
    }]

    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(quad1)
        input.push(quad2)
        input.push(null)
      }
    })

    const serializer = new JsonLdSerializer({encoding: 'string'})
    const stream = serializer.import(input)

    return waitForContent(stream).then(content => {
      assert.deepEqual(JSON.parse(content), jsonld)
    })
  })

  it('should serialize throw an error if the given encoding is unknown', () => {
    return expectError(() => {
      const input = new Readable({
        objectMode: true,
        read: () => {
          input.push(null)
        }
      })

      const serializer = new JsonLdSerializer({encoding: 'not a valid encoding'})

      serializer.import(input)
    })
  })
})
