import { config } from '@dotenvx/dotenvx';
config();

import { Ollama } from 'ollama';

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
