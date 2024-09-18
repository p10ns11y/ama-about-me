// import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import './initialize';

import { retrieveUsingInMemory } from './in-memory-vectorstore';
import { getEmbedding } from './embedding';
import { getChromaVectorStore } from './chroma-vectorstore';
import { chatAboutDocumentsContent } from './chat-about-documents-content';

async function main() {
  console.log('main....');
  let embeddings = getEmbedding();

  await retrieveUsingInMemory(embeddings);

  // console.time('chat started');
  // await chatAboutDocumentsContent({
  //   getVectorStore: getChromaVectorStore,
  // });
  // console.timeEnd('chat ended');
}

main();
