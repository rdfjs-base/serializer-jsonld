const SerializerStream = require('./lib/SerializerStream')
const Sink = require('rdf-sink')

class Serializer extends Sink {
  constructor () {
    super(SerializerStream)
  }
}

module.exports = Serializer
