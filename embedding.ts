import { OllamaEmbeddings } from '@langchain/ollama';

export function getEmbedding() {
  let embeddings = new OllamaEmbeddings({});

  return embeddings;
}
