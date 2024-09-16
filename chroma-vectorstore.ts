import { OllamaEmbeddings } from '@langchain/ollama';

import { Chroma } from '@langchain/community/vectorstores/chroma';

let documentsVectorStore: Chroma | null = null;
export function getChromaVectorStore({ cache } = { cache: true }) {
  let embeddings = new OllamaEmbeddings({});

  if (!documentsVectorStore || !cache) {
    documentsVectorStore = new Chroma(embeddings, {
      collectionName: 'pdfdocuments-collections',
      url: 'http://localhost:8000',
    });
  }

  return documentsVectorStore;
}
