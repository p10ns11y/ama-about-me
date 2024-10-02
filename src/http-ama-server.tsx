// import { AsyncLocalStorage } from 'node:async_hooks'
import { renderToReadableStream } from "react-dom/server";

import { setupOllama } from './setup-ollama';
// import { check } from './check';
import { serverSentEvent } from './helpers/server-sent-event-template-tag'

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
      {/* <div>
        <form action="/action/retrieve">
          <button type="submit">
            Retrieve
          </button>
        </form>
      </div> */}
    </div>
  )
}

Bun.serve({
  port: PORT,
  async fetch(request) {
    let path = new URL(request.url).pathname;

    // if (path === '/action/retrieve') {
    //   // value need to be stored in async local storage
    //   check('retrieveUsingInMemory');
    // }

    if (path === '/ollama-status') {
      let status = await setupOllama()

      let ollamaServerSentEvent = serverSentEvent`
        ${{
          name: 'status', 
          type: 'data', 
          value: status,
        }}
      `

      return new Response(ollamaServerSentEvent, {
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