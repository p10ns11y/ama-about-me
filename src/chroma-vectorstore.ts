import { Chroma } from '@langchain/community/vectorstores/chroma';

import { getEmbeddings } from './embedding';

let chromaURL = process.env.BASE_CHROMA_URL || 'http://0.0.0.0:8000';

let documentsVectorStore: Chroma | null = null;

type Options = {
  cache: boolean;
  collectionName?: string;
};

let embeddingsPromise = getEmbeddings();

export async function getChromaVectorStore(options: Options = { cache: true }) {
  let { cache, collectionName = 'default-collection' } = options;
  let embeddings = await embeddingsPromise;

  if (!documentsVectorStore || !cache) {
    documentsVectorStore = new Chroma(embeddings, {
      collectionName,
      url: chromaURL,
    });
  }

  return documentsVectorStore;
}
