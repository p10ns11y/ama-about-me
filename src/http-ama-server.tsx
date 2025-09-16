import { AsyncLocalStorage } from 'node:async_hooks'
import { renderToReadableStream } from "react-dom/server";

// import type { Server } from 'bun'

// https://stately.ai/docs/quick-start

import './initialize';

import { setupOllama } from './setup-ollama';
import { retrieveUsingInMemory } from './in-memory-vectorstore'
// import { check } from './check';
import { serverSentEvent } from './helpers/server-sent-event-template-tag'

let PORT = 3000;

let dataStore = new AsyncLocalStorage()



let clientEventSourceScript = `
  let eventSource = new globalThis.EventSource('/ollama-status');
  let statusElement = document.getElementById('ollamaStatus')
  statusElement.textContent = 'sourcing...'

  eventSource.addEventListener('status', (event) => {
    if (statusElement) {
      statusElement.textContent = event.data
      eventSource.close()
    }
  });

  let streamSource = new globalThis.EventSource('/sse');
  let qaElement = document.getElementById('qa')

  streamSource.addEventListener('content-update', (event) => {
    // let store = JSON.parse(event.data)
    //   let updatedContent = (store) =>  \`
    //     <p style={{ color: 'blueviolet' }}>Question: <span>\${store.input}</span></p>
    //     <p style={{ color: 'olive' }}>Answer: <span>\${store.answer}</span></p>
    //  \`.trim();

    if (qaElement) {
      if (event.data.includes('Question')) {
        input.textContent = event.data
      }
      if (event.data.includes('Answer')) {
        answer.textContent = event.data
      }
      // qaElement.innerHTML = updatedContent(store)
    }
    // window.location.reload()
  });
` 

function AskMeAnything() {
  // Reactivity without state manager ?!
  let store = dataStore.getStore()

  let qa = null
  if (store) {
    // when using storage
    qa = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
         <p style={{ color: 'blueviolet' }}>Question: <span>{store.input}</span></p>
         <p style={{ color: 'olive' }}>Answer: <span>{store.answer}</span></p>
      </div>
    )
  }

  return (
    <div id="ollamaStatusContainer">
      <div>
        <span>Ollama status is: </span>
        <span id="ollamaStatus">idle</span>
      </div>
      {/* Server sent content */}
      <div id="qa">
        <p style={{ color: 'blueviolet' }}><span id="input"></span></p>
        <p style={{ color: 'olive' }}><span id="answer"></span></p>
      </div>
      {/* <div>
        {qa}
         
        <button onClick={async () => {
          console.log('retrieveUsingInMemory...')
          let output = await retrieveUsingInMemory()
          setRetrievedContent(output)
        }}>
          Retrieve
        </button>
        <form action="/action/retrieve">
          <button type="submit">
            Retrieve from memory
          </button>
        </form>
      </div> */}
    </div>
  )
}

async function getComponentStream() {
  return renderToReadableStream(
    <div>
      <div>Welcome to streaming</div>
      <AskMeAnything />
    </div>,
    {
      bootstrapScriptContent: clientEventSourceScript
    }
  )
}

async function dispatchServerSentEvents() {
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


// Simplify
async function updateStreamInBackground() {
  const output = await retrieveUsingInMemory();

  const updatedContent = await dataStore.run(output, () => {
    const store = dataStore.getStore();
    // HTML ?!
    // return `
    //   <p style="color: blueviolet">Question: <span>${store.input}</span></p>
    //   <p style="color: olive">Answer: <span>${store.answer}</span></p>
    // `.trim();
    return store
  }) as { input: string, answer: string};


  let contentUpdateServerSentEvent = serverSentEvent`
    ${{
      name: 'content-update', 
      type: 'data', 
      value: `Question ${updatedContent.input}`,
    }}
    ${{
      name: 'content-update', 
      type: 'data', 
      value: `Answer  ${updatedContent.answer}`,
    }}
  `

  return new Response(contentUpdateServerSentEvent, {
    headers: { 
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    },
  });

  // let updatedStream = await dataStore.run(output, getComponentStream);

  // Mess
  // server.reload({
  //   async fetch(request) {
  //     let path = new URL(request.url).pathname;

  //     if (path === '/ollama-status') {
  //       return await dispatchServerSentEvents();
  //     }

  //     if (updatedStream.locked) {
  //       updatedStream.cancel()
  //       updateStreamInBackground(server)

  //       return new Response(await getComponentStream(), {
  //         headers: { "Content-Type": "text/html" },
  //       });
  //     }
  
  //     return new Response(updatedStream, {
  //       headers: { "Content-Type": "text/html" },
  //     });
  //   }
  // });
}

Bun.serve({
  port: PORT,
  async fetch(request, server) {
  let path = new URL(request.url).pathname;

    if (path === '/ollama-status') {
      return await dispatchServerSentEvents();
    }

    if (path === '/sse') {
      // Use sse to send a signal to client and let it fetch specific data
      // const response = new Response(new ReadableStream(), {
      //   headers: { 
      //     "Content-Type": "text/event-stream",
      //     "Cache-Control": "no-cache",
      //     "Connection": "keep-alive"
      //   },
      // });

      return await updateStreamInBackground();
    }

    let initialStream = await dataStore.run({}, getComponentStream);

    if (path === '/') {
      return new Response(initialStream, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log('Server is running at:', PORT)
