const Readable = require('readable-stream')

class SerializerStream extends Readable {
  constructor (input, options) {
    super()

    this.options = options || {}

    this._readableState.objectMode = true
    this._read = () => {}

    this.graph = []
    this.subjects = {}

    input.on('data', (quad) => {
      let index = this.subjectIndex(quad.subject)
      let property = quad.predicate.value

      if (property === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        if (typeof this.graph[index]['@type'] === 'undefined') {
          this.graph[index]['@type'] = []
        }

        this.graph[index]['@type'].push(quad.object.value)
      } else {
        if (typeof this.graph[index][property] === 'undefined') {
          this.graph[index][property] = SerializerStream.objectValue(quad.object)
        } else {
          if (!Array.isArray(this.graph[index][property])) {
            this.graph[index][property] = [this.graph[index][property]]
          }

          this.graph[index][property].push(SerializerStream.objectValue(quad.object))
        }
      }
    })

    input.on('end', () => {
      if (this.options.outputFormat === 'string') {
        this.push(JSON.stringify(this.graph))
      } else {
        this.push(this.graph)
      }

      this.push(null)
    })

    input.on('error', (err) => {
      this.emit('error', err)
    })
  }

  subjectIndex (subject) {
    if (typeof this.subjects[subject.value] === 'undefined') {
      if (subject.termType === 'BlankNode') {
        this.graph.push({'@id': '_:' + subject.value})
      } else {
        this.graph.push({'@id': subject.value})
      }

      this.subjects[subject.value] = this.graph.length - 1
    }

    return this.subjects[subject.value]
  }

  static objectValue (object) {
    if (object.termType === 'NamedNode') {
      return {'@id': object.value}
    } else if (object.termType === 'BlankNode') {
      return {'@id': '_:' + object.value}
    } else {
      if (object.language) {
        return {'@language': object.language, '@value': object.value}
      } else if (object.datatype && !object.datatype.value === 'http://www.w3.org/2001/XMLSchema#string') {
        return {'@type': object.datatype.value, '@value': object.value}
      } else {
        return object.value
      }
    }
  }
}

module.exports = SerializerStream
