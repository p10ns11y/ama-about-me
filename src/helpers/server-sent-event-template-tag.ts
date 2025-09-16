type EventData = {
    type: 'data';
    name?: string;
    value: string;
  } 
  
  type EventDataChunks = {
    type: 'chunks';
    name?: string;
    value: string[];
  }
  
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
  export type Event = EventData | EventDataChunks;
  
  export function serverSentEvent(
    _unusedStrings: TemplateStringsArray, 
    ...events: Array<Event>
  ) {
  let eventStreamContent = events.map(event => {
    let value;

    if (event.type === 'data') {
      value = `data: ${event.value}`
    }

    if (event.type === 'chunks') {
      value = event.value.map((v: string) => `data: ${v}`).join('\n')
    }

    if (event.name) {
      return `event: ${event.name}\n${value}`
    }

    return `${value}`
  }).join('\n\n')
  
  
  // The double newline at the end is crucial. Not mentioned in 
  // The documentation https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
  // Figured out by Claude AI 🙏
  // For more info: https://web.dev/articles/eventsource-basics
  return `${eventStreamContent}\n\n`;
}
  