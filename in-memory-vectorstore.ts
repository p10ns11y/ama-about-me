import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { createRetrievalChain } from 'langchain/chains/retrieval';
import { RetrievalQAChain } from 'langchain/chains';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { ChatGroq } from '@langchain/groq';

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

  // Send the user question with retrived documents, chat history to ChatModels
  // LLM
  let llm = new ChatGroq({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
  });

  // Prompt and retrieval chain
  let prompt = ChatPromptTemplate.fromTemplate(
    `Answer the user's question: {input} based on the following context {context}`
  );

  let combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  let retrievalChain = await createRetrievalChain({
    combineDocsChain,
    retriever: maximumMarginalRelevanceRetriever,
  });

  let answer = await retrievalChain.invoke({
    input: 'One sentence for the evolution of programming',
  });

  // Display
  console.log('From simple retriever...', result.flat(), '-----\n');
  console.log('From retrieval chain...', answer, '-----\n');

  console.log('---- In Memory Store end ---- \n\n');
}
