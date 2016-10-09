const Readable = require('stream').Readable

class JsonLdSerializer extends Readable {
  constructor (options) {
    super()

    this.options = options || {}

    this._readableState.objectMode = true
    this._read = () => {}

    this.graph = []
    this.subjects = {}
  }

  import (stream) {
    stream.on('data', (quad) => {
      let index = this.subjectIndex(quad.subject)
      let property = quad.predicate.value

      if (property === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
        if (typeof this.graph[index]['@type'] === 'undefined') {
          this.graph[index]['@type'] = []
        }

        this.graph[index]['@type'].push(triple.object.value)
      } else {
        if (typeof this.graph[index][property] === 'undefined') {
          this.graph[index][property] = JsonLdSerializer.objectValue(quad.object)
        } else {
          if (!Array.isArray(this.graph[index][property])) {
            this.graph[index][property] = [this.graph[index][property]]
          }

          this.graph[index][property].push(JsonLdSerializer.objectValue(quad.object))
        }
      }
    })

    stream.on('end', () => {
      if (this.options.outputFormat === 'string') {
        this.push(JSON.stringify(this.graph))
      } else {
        this.push(this.graph)
      }

      this.graph = []
      this.subjects = {}

      this.emit('end')
    })

    stream.on('error', (err) => {
      this.graph = []
      this.subjects = {}

      this.emit('error', err)
    })

    return this
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

  static import (stream) {
    let serializer = new JsonLdSerializer()

    serializer.import(stream)

    return serializer
  }
}

module.exports = JsonLdSerializer
