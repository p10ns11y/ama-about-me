import { OllamaEmbeddings } from '@langchain/ollama';

const ollamaBaseUrl = process.env.BASE_OLLAMA_URL || 'http://localhost:11434';

export function getEmbedding() {
  let embeddings = new OllamaEmbeddings({
    model: 'mxbai-embed-large',
    baseUrl: ollamaBaseUrl,
  });

  return embeddings;
}
