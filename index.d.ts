import * as Sink from '@rdfjs/sink';
import { EventEmitter } from 'events';
import { Stream } from 'rdf-js';

interface SerializerOptions {
  encoding?: 'string' | 'object';
}

declare class Serializer extends Sink {
  constructor(options?: SerializerOptions);

  import(stream: Stream, options?: SerializerOptions): EventEmitter;
}

export = Serializer
