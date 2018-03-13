const Readable = require('readable-stream')

class SerializerStream extends Readable {
  constructor (input, options) {
    super({
      objectMode: true
    })

    this.options = options || {}

    this.output = []

    input.on('data', (quad) => {
      const jsonld = {}
      let triple = jsonld

      if (quad.graph.termType !== 'DefaultGraph') {
        jsonld['@id'] = quad.graph.value
        jsonld['@graph'] = {}
        triple = jsonld['@graph']
      }

      triple['@id'] = SerializerStream.subjectValue(quad.subject)

      if (quad.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        triple['@type'] = quad.object.value
      } else {
        triple[quad.predicate.value] = SerializerStream.objectValue(quad.object)
      }

      this.output.push(jsonld)
    })

    input.on('end', () => {
      this.push(this.output)
      this.push(null)
    })

    input.on('error', (err) => {
      this.emit('error', err)
    })
  }

  _read () {}

  static subjectValue (subject) {
    return subject.termType === 'BlankNode' ? '_:' + subject.value : subject.value
  }

  static objectValue (object) {
    if (object.termType === 'NamedNode') {
      return {'@id': object.value}
    }

    if (object.termType === 'BlankNode') {
      return {'@id': '_:' + object.value}
    }

    if (object.language) {
      return {'@language': object.language, '@value': object.value}
    } else if (object.datatype && object.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
      return {'@type': object.datatype.value, '@value': object.value}
    } else {
      return object.value
    }
  }
}

module.exports = SerializerStream
