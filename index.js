var rdf = require('rdf-ext')()
var util = require('util')
var AbstractSerializer = require('rdf-serializer-abstract')

function JsonLdSerializer () {
  AbstractSerializer.call(this, rdf)
}

util.inherits(JsonLdSerializer, AbstractSerializer)

JsonLdSerializer.prototype.serialize = function (graph, done) {
  return new Promise(function (resolve) {
    done = done || function () {}

    var jsonGraph = []
    var subjects = {}

    var subjectIndex = function (subject) {
      var value = subject.valueOf()

      if (typeof subjects[value] === 'undefined') {
        if (subject.interfaceName === 'BlankNode') {
          jsonGraph.push({ '@id': '_:' + value })
        } else {
          jsonGraph.push({ '@id': value })
        }

        subjects[value] = jsonGraph.length - 1
      }

      return subjects[value]
    }

    var objectValue = function (object) {
      var value = object.valueOf()

      if (object.interfaceName === 'NamedNode') {
        return { '@id': value }
      } else if (object.interfaceName === 'BlankNode') {
        return { '@id': '_:' + value }
      } else {
        if (object.language) {
          return { '@language': object.language, '@value': value }
        } else if (object.datatype && object.datatype.valueOf() !== 'http://www.w3.org/2001/XMLSchema#string') {
          return { '@type': object.datatype.valueOf(), '@value': value }
        } else {
          return value
        }
      }
    }

    graph.forEach(function (triple) {
      var index = subjectIndex(triple.subject)
      var predicateValue = triple.predicate.valueOf()

      if (predicateValue === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        if (typeof jsonGraph[index]['@type'] === 'undefined') {
          jsonGraph[index]['@type'] = []
        }

        jsonGraph[index]['@type'].push(triple.object.valueOf())
      } else {
        if (typeof jsonGraph[index][predicateValue] === 'undefined') {
          jsonGraph[index][predicateValue] = objectValue(triple.object)
        } else {
          if (!Array.isArray(jsonGraph[index][predicateValue])) {
            jsonGraph[index][predicateValue] = [jsonGraph[index][predicateValue]]
          }

          jsonGraph[index][predicateValue].push(objectValue(triple.object))
        }
      }
    })

    done(null, jsonGraph)

    resolve(jsonGraph)
  })
}

module.exports = JsonLdSerializer
