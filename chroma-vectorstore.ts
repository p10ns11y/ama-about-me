import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import { ChatGroq } from '@langchain/groq';

import type { Document } from 'langchain/document';
import type { OllamaEmbeddings } from '@langchain/ollama';

export async function retrieveUsingChroma(
  embeddings: OllamaEmbeddings,
  documents: Document<Record<string, any>>[]
) {
  console.log('---- Chroma Store start ---- \n\n');
  let documentsVectorStore = new Chroma(embeddings, {
    collectionName: 'douments-vector-store',
    url: 'http://localhost:8000',
  });

  await documentsVectorStore.addDocuments(documents);

  // Querying directly
  const similaritySearchResults = await documentsVectorStore.similaritySearch(
    'When and how programming started?',
    2
  );

  for (const doc of similaritySearchResults) {
    console.log(`* ${doc.pageContent}`);
  }

  const similaritySearchWithScoreResults =
    await documentsVectorStore.similaritySearchWithScore(
      'When and how programming started?',
      2
    );

  for (const [doc, score] of similaritySearchWithScoreResults) {
    console.log(`* [Similarity Score =${score.toFixed(3)}] ${doc.pageContent}`);
  }

  // Retrivel
  const similarityRetriever = documentsVectorStore.asRetriever({
    searchType: 'similarity',
    k: 2,
  });

  // Compression
  let llm = new ChatGroq({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
  });
  let compressor = LLMChainExtractor.fromLLM(llm);

  let contextualRetriver = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever: documentsVectorStore.asRetriever({
      k: 2,
    }),
  });

  let compressedDocs = await contextualRetriver.invoke(
    'When and how programming started?'
  );

  // Result
  let result = await similarityRetriever.invoke('Why programming?');

  // TODO: Send the user question with retrived documents, chat history to ChatModels

  // Display
  console.log('normal retrive result', result, '\n\n');

  console.log(
    'compressed and contextual relevant documents',
    compressedDocs,
    '\n\n'
  );

  console.log('---- Chroma Store end ---- \n\n');
}
