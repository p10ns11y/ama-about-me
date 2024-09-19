// import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import './initialize';

import { retrieveUsingInMemory } from './in-memory-vectorstore';
import { getEmbedding } from './embedding';
import { getChromaVectorStore } from './chroma-vectorstore';
import { chatAboutDocumentsContent } from './chat-about-documents-content';

import { Ollama } from 'ollama';

import http from 'http';

async function main() {
  console.log('main....');
  // let embeddings = getEmbedding();

  // await retrieveUsingInMemory(embeddings);

  // console.time('chat started');
  // await chatAboutDocumentsContent({
  //   getVectorStore: getChromaVectorStore,
  // });
  // console.timeEnd('chat ended');
}

// main();

let PORT = 3000;

const ollamaBaseUrl = process.env.BASE_OLLAMA_URL || 'http://localhost:11434';

async function setupOllama() {
  try {
    let ollama = new Ollama({
      host: ollamaBaseUrl,
    });
    let modelList = await ollama.list();

    console.log(modelList.models);

    console.time('Pulling model');
    await ollama.pull({ model: 'mxbai-embed-large' });
    console.timeEnd('Pulling model');
  } catch (error) {
    console.error(error);
  }
}

const server = http.createServer((req, res) => {
  void setupOllama();
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end('This is a simple Node.js server.\n');
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
