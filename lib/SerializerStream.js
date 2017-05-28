const Readable = require('readable-stream')

class SerializerStream extends Readable {
  constructor (input, options) {
    super()

    this.options = options || {}

    this._readableState.objectMode = true
    this._read = () => {}

    this.context = {}
    this.output = []

    input.on('data', (quad) => {
      const property = quad.predicate.value

      if (property === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        this.output.push({
          '@id': SerializerStream.graphValue(quad.graph),
          '@graph': {
            '@id': SerializerStream.subjectValue(quad.subject),
            '@type': quad.object.value
          }
        })
      } else {
        const jsonGraph = {
          '@id': SerializerStream.subjectValue(quad.subject)
        }

        jsonGraph[property] = SerializerStream.objectValue(quad.object)

        this.output.push({
          '@id': SerializerStream.graphValue(quad.graph),
          '@graph': jsonGraph
        })
      }
    })

    input.on('end', () => {
      if (this.options.outputFormat === 'string') {
        this.push(JSON.stringify(this.output))
      } else {
        this.push(this.output)
      }

      this.push(null)
    })

    input.on('error', (err) => {
      this.emit('error', err)
    })
  }

  static graphValue (graph) {
    return graph.value || '@default'
  }

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
