import { config } from '@dotenvx/dotenvx';

import { Ollama } from 'ollama';

config();

// Need to rework, there is some issues
// node app access ollama models which runs another container
// Following error is thrown
//    ConnectionRefused: Unable to connect. Is the computer able to access the url?
//    amachat-1  |  path: "http://127.0.0.1:11434/api/tags"
// the url is accessible from host browser, node REPL, and curl in terminal
// Only programatically it fails

let ollama = new Ollama();
let modelList = await ollama.list();

let embedModelPulledAlready = Boolean(
  modelList?.models?.find((model) =>
    model?.name?.startsWith('mxbai-embed-large')
  )
);

console.log({ embedModelPulledAlready });

if (!embedModelPulledAlready) {
  console.time('Pulling model');
  await ollama.pull({ model: 'mxbai-embed-large' });
  console.timeEnd('Pulling model');
}
