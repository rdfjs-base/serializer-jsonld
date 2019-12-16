import * as Sink from '@rdfjs/sink';
import { EventEmitter } from 'events';
import { Stream } from 'rdf-js';

type Encoding = 'string' | 'object';

interface SerializerOptions {
  encoding?: Encoding;
}

declare class Serializer extends Sink {
  constructor(options?: SerializerOptions);

  import(stream: Stream, options?: SerializerOptions): EventEmitter;
}

export = Serializer
