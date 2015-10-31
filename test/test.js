/* global describe, it */
var assert = require('assert')
var jsonld = require('jsonld')
var rdf = require('rdf-ext')
var testData = require('rdf-test-data')
var testUtils = require('rdf-test-utils')
var JsonLdSerializer = require('../')

var simpleGraph = rdf.createGraph()

simpleGraph.add(rdf.createTriple(
  rdf.createNamedNode('http://example.org/subject'),
  rdf.createNamedNode('http://example.org/predicate'),
  rdf.createLiteral('object')
))

describe('JSON-LD serializer', function () {
  describe('instance API', function () {
    describe('callback API', function () {
      it('should be supported', function (done) {
        var serializer = new JsonLdSerializer()

        Promise.resolve(new Promise(function (resolve, reject) {
          serializer.serialize(simpleGraph, function (error) {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('Promise API', function () {
      it('should be supported', function (done) {
        var serializer = new JsonLdSerializer()

        serializer.serialize(simpleGraph).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('Stream API', function () {
      it('should be supported', function (done) {
        var serializer = new JsonLdSerializer()
        var jsonGraph

        serializer.stream(simpleGraph).on('data', function (data) {
          jsonGraph = data
        }).on('end', function () {
          if (!jsonGraph) {
            done('no data streamed')
          } else {
            done()
          }
        }).on('error', function (error) {
          done(error)
        })
      })
    })
  })

  describe('static API', function () {
    describe('callback API', function () {
      it('should be supported', function (done) {
        Promise.resolve(new Promise(function (resolve, reject) {
          JsonLdSerializer.serialize(simpleGraph, function (error) {
            if (error) {
              reject(error)
            } else {
              resolve()
            }
          })
        })).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('Promise API', function () {
      it('should be supported', function (done) {
        JsonLdSerializer.serialize(simpleGraph).then(function () {
          done()
        }).catch(function (error) {
          done(error)
        })
      })
    })

    describe('Stream API', function () {
      it('should be supported', function (done) {
        var jsonGraph

        JsonLdSerializer.stream(simpleGraph).on('data', function (data) {
          jsonGraph = data
        }).on('end', function () {
          if (!jsonGraph) {
            done('no data streamed')
          } else {
            done()
          }
        }).on('error', function (error) {
          done(error)
        })
      })
    })
  })

  describe('options', function () {
    it('outputString should convert output to String', function (done) {
      Promise.all([
        (new JsonLdSerializer({outputString: false})).serialize(simpleGraph).then(function (serialized) {
          assert.equal(typeof serialized, 'object')
        }),

        (new JsonLdSerializer({outputString: true})).serialize(simpleGraph).then(function (serialized) {
          assert.equal(typeof serialized, 'string')
        })
      ]).then(function () {
        done()
      }).catch(function (error) {
        done(error)
      })
    })
  })

  describe('example data', function () {
    it('card should be serialized', function (done) {
      var serializer = new JsonLdSerializer()

      Promise.all([
        serializer.serialize(testData.cardGraph).then(function (cardJson) {
          return jsonld.promises().normalize(cardJson)
        }),

        testUtils.p.readFile('support/card.json', __dirname).then(function (cardString) {
          return jsonld.promises().normalize(JSON.parse(cardString))
        })
      ]).then(function (results) {
        assert.deepEqual(results[0], results[1])
      }).then(function () {
        done()
      }).catch(function (error) {
        done(error)
      })
    })
  })
})
