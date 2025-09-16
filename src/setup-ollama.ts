import { Ollama } from 'ollama';

const ollamaBaseUrl = process.env.BASE_OLLAMA_URL || 'http://0.0.0.0:11434';

let sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function setupOllama() {
  let status = 'initial';
  if (!process.env.BASE_OLLAMA_URL) {
    // In dev environment it is already setup locally
    status = 'available_already';

    await sleep(5000)
   
    return status;
  }

  try {
    let ollama = new Ollama({
      host: ollamaBaseUrl,
    });
    let modelList = await ollama.list();

    console.log(modelList.models);

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
    status = 'success';
  } catch (error) {
    console.error(error);
    status = 'error';
  }

  return status;
}
