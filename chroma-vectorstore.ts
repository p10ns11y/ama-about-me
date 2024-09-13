import { ChatPromptTemplate } from '@langchain/core/prompts';

import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';

import { ChatGroq } from '@langchain/groq';

import { Chroma } from '@langchain/community/vectorstores/chroma';

import type { Document } from 'langchain/document';
import type { BaseMessage } from '@langchain/core/messages';
import type { OllamaEmbeddings } from '@langchain/ollama';

export async function retrieveUsingChroma(
  embeddings: OllamaEmbeddings,
  documents: Document<Record<string, any>>[]
) {
  console.log('---- Chroma Store start ---- \n\n');
  let documentsVectorStore = new Chroma(embeddings, {
    collectionName: 'pdfs-vector-store',
    url: 'http://localhost:8000',
  });

  await documentsVectorStore.addDocuments(documents);

  // Compression
  let llm = new ChatGroq({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
  });
  let compressor = LLMChainExtractor.fromLLM(llm);

  let contextualRetriver = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever: documentsVectorStore.asRetriever({
      k: 10,
    }),
  });

  let compressedDocs = await contextualRetriver.invoke(
    'What is more challenging for web developers?'
  );

  console.log(
    'compressed and contextual relevant documents',
    compressedDocs,
    '\n\n'
  );

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
    retriever: contextualRetriver,
  });

  let firstQuestion = 'What is more challenging for web developers?';

  let chatHistory = [] as BaseMessage[] | string;
  let chatmodelOutput = await retrievalChain.invoke({
    input: firstQuestion,
    chat_history: chatHistory,
  });

  chatHistory = [
    ...chatHistory,
    ...[
      chatmodelOutput.input,
      chatmodelOutput.answer,
      // Testing it capability
      'There are so many buzz and threadful articles and news',
    ],
  ] as BaseMessage[];

  let followUpQuestion = 'How to overcome the development challenges?';

  let followUpOutput = await retrievalChain.invoke({
    input: followUpQuestion,
    chat_history: chatHistory,
  });

  // Display
  console.log('From retrieval chain...', chatmodelOutput, '-----\n');
  console.log(
    'Follow up query with chat histroy...\n',
    followUpOutput,
    '-----\n'
  );

  console.log('---- Chroma Store end ---- \n\n');
}
