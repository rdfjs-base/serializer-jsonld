/* global describe, it */

const assert = require('assert')
const rdf = require('@rdfjs/data-model')
const Readable = require('readable-stream')
const waitForContent = require('./waitForContent')
const JsonLdSerializer = require('..')

describe('@rdfjs/serializer-jsonld integer serialization', () => {
  it('should serialize datatype xsd:integer to plain int', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('42', rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 42
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
      assert.deepStrictEqual(content, jsonld)
    })
  })

  it('should not serialize datatype xsd:integer to plain int if NaN', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('text', rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')))

    const jsonld = [{
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': {
        '@value': 'text',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer'
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
      assert.deepStrictEqual(content, jsonld)
    })
  })
})
