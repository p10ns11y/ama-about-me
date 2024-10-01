import { Writable } from 'node:stream'

import  { useState, useEffect } from 'react'
import { renderToReadableStream } from "react-dom/server";

import { setupOllama } from './setup-ollama.ts';
// import { check } from './check.ts';

let PORT = 3000;

// // TODO: Improve using https://nodejs.org/api/stream.html
// const server = http.createServer((req, res) => {
//   void setupOllama(); /*.then((status) => {
//     res.write(`ollama status is: ${status}`);
//   }); */
//   void check('retrieveUsingInMemory');

//   res.writeHead(200, { 'Content-Type': 'text/plain' });

//   res.end('This is a simple Node.js server.\n');
// });

// server.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });

function AskMeAnything() {
  // async supported but will block rendering of whole component
  // As long as it is part of the component
  // let status = await setupOllama();
  // let [ollamaStatus, setOllamaStatus] = useState('idle')

  // useEffect(() => {
  //   let source = new globalThis.EventSource('/ollama-status');
  //   source.onmessage = (e) => {
  //       setOllamaStatus(e.data)
  //   };
  // }, [])

  // void setupOllama().then(status => {
  // Logged server side
  //   console.log('status:', status)
  //   setOllamaStatus(status)
  // })

  

  return (
    <div id="ollamaStatusContainer">
      <span>Ollama status is: </span>
      <span id="ollamaStatus">idle</span>
    </div>
  )
}



let server = Bun.serve({
  port: PORT,
  async fetch(request) {
    let path = new URL(request.url).pathname;

    if (path === '/ollama-status') {
      let status = await setupOllama()
      return new Response(status, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }



    let initialStream = await renderToReadableStream(
      <div>
        <div>Welcome to streaming</div>
        <AskMeAnything />
      </div>,
      {
        bootstrapScriptContent: `
          let source = new globalThis.EventSource('/ollama-status');
          let statusElement = document.getElementById('ollamaStatus')
          statusElement.textContent = 'sourcing...'
          source.onmessage = (e) => {
            console.log(e.data)
            let statusElement = document.getElementById('ollamaStatus')
            console.log(statusElement)

            if (statusElement) {
              statusElement.textContent = e.data
            }
          };
        ` 
      }
    )

    // let reader = initialStream.getReader()

    // const stream = new ReadableStream({
    //   start(controller) {
    //     // The following function handles each data chunk
    //     function push() {
    //       // "done" is a Boolean and value a "Uint8Array"
    //       return reader.read().then(({ done, value }) => {
    //         // Is there no more data to read?
    //         if (done) {
    //           // Tell the browser that we have finished sending data
    //           controller.close();
    //           return;
    //         }
  
    //         // Get the data and send it to the browser via the controller
    //         controller.enqueue(value);
    //         push();
    //       });
    //     }
  
    //     push();
    //   },
    // });

    return new Response(initialStream, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log('Server is running at:', PORT)