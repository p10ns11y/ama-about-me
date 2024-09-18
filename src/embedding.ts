import { OllamaEmbeddings } from '@langchain/ollama';

export function getEmbedding() {
  let embeddings = new OllamaEmbeddings({
    model: 'mxbai-embed-large',
  });

  embeddings.model;

  return embeddings;
}
