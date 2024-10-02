import { renderToReadableStream } from "react-dom/server";

import { setupOllama } from './setup-ollama.ts';
// import { check } from './check.ts';

let PORT = 3000;

let clientEventSourceScript = `
  let eventSource = new globalThis.EventSource('/ollama-status');
  let statusElement = document.getElementById('ollamaStatus')
  statusElement.textContent = 'sourcing...'

  eventSource.addEventListener('status', (event) => {
    
    let statusElement = document.getElementById('ollamaStatus')
    console.log(statusElement)

    if (statusElement) {
      statusElement.textContent = event.data
      eventSource.close()
    }
  });
` 

function AskMeAnything() {
  return (
    <div id="ollamaStatusContainer">
      <div>
        <span>Ollama status is: </span>
        <span id="ollamaStatus">idle</span>
      </div>
    </div>
  )
}

Bun.serve({
  port: PORT,
  async fetch(request) {
    let path = new URL(request.url).pathname;

    if (path === '/ollama-status') {
      let status = await setupOllama()
      // The double newline at the end is crucial. Not mentioned in 
      // The documentation https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
      // Figured out by Claude AI 🙏
      return new Response(`:event stream

event: status
data: ${status}


      `, {
        headers: { 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        },
      });
    }


    let initialStream = await renderToReadableStream(
      <div>
        <div>Welcome to streaming</div>
        <AskMeAnything />
      </div>,
      {
        bootstrapScriptContent: clientEventSourceScript
      }
    )

    return new Response(initialStream, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log('Server is running at:', PORT)