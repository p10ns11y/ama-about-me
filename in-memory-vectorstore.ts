import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import type { Document } from 'langchain/document';
import type { OllamaEmbeddings } from '@langchain/ollama';

export async function retrieveUsingInMemory(
  embeddings: OllamaEmbeddings,
  documents: Document<Record<string, any>>[]
) {
  console.log('---- In Memory Store start ----\n');
  const vectorStore = new MemoryVectorStore(embeddings);

  // This also creates embeddings for these documents
  await vectorStore.addDocuments(documents);

  // console.log(vectorStore.memoryVectors);

  // Querying directly
  const similaritySearchResults = await vectorStore.similaritySearch(
    'When and how programming started?',
    2
  );

  for (const doc of similaritySearchResults) {
    console.log(`* ${doc.pageContent}`);
  }

  // Retrivel
  const similarityRetriever = vectorStore.asRetriever({
    searchType: 'similarity',
    k: 2,
  });

  const maximumMarginalRelevanceRetriever = vectorStore.asRetriever({
    searchType: 'mmr',
    searchKwargs: {
      fetchK: 10,
    },
    k: 2,
  });

  // Result
  let result = await Promise.all([
    similarityRetriever.invoke('When and how programming started?'),
    maximumMarginalRelevanceRetriever.invoke(
      'When and how programming started?'
    ),
  ]);

  // TODO: Send the user question with retrived documents, chat history to ChatModels

  // Display
  console.log(result.flat());
  console.log('---- In Memory Store end ---- \n\n');
}
