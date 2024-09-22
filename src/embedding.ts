import { OllamaEmbeddings } from '@langchain/ollama';

const ollamaBaseUrl = process.env.BASE_OLLAMA_URL || 'http://0.0.0.0:11434';

export async function getEmbeddings() {
  let embeddings = new OllamaEmbeddings({
    model: 'mxbai-embed-large',
    baseUrl: ollamaBaseUrl,
  });

  return embeddings;
}
