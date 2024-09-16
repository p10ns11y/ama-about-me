import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';

import { ChatPromptTemplate } from '@langchain/core/prompts';

import { ChatGroq } from '@langchain/groq';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

import type { BaseMessage } from '@langchain/core/messages';
import type { Chroma } from '@langchain/community/vectorstores/chroma';

export async function chatAboutDocumentsContent({
  getVectorStore,
}: {
  getVectorStore: (options?: { cache: boolean }) => Chroma;
}) {
  console.log('---- Chroma Store start ---- \n\n');
  console.time('chroma collection');

  console.log('---- documentsVectorStore created ---- \n\n');
  console.timeEnd('chroma collection');

  // Load multiple different docuemnts
  let directoryLoader = new DirectoryLoader('./data/pdfs', {
    '.pdf': (path: string) =>
      new PDFLoader(path, {
        parsedItemSeparator: '\n',
        splitPages: true,
        pdfjs: () =>
          // @ts-ignore no type defs for pdf-dist yet
          import('pdf-dist/build/pdf.js').then((module) => module.default),
      }),
  });

  let recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });

  let pdfDocuments = await directoryLoader.load();

  console.log('total pdfDocuments', pdfDocuments.length);
  // Default get the cached vectorstore
  let documentsVectorStore = getVectorStore();
  let splittedPdfDocuments = await recursiveSplitter.splitDocuments(
    pdfDocuments
  );

  console.log('total splittedPdfDocuments', splittedPdfDocuments.length);

  console.log('---- Adding and embedding documents ---- \n\n');
  console.time('add and embed documents');
  await documentsVectorStore.addDocuments(splittedPdfDocuments);
  console.timeEnd('add and embed documents');

  // Compression
  let llm = new ChatGroq({
    model: 'mixtral-8x7b-32768',
    temperature: 0,
  });
  let compressor = LLMChainExtractor.fromLLM(llm);

  let contextualRetriver = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever: documentsVectorStore.asRetriever({
      k: 5,
    }),
  });

  let compressedDocs = await contextualRetriver.invoke(
    'What is more challenging for LLM app developers?'
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

  let firstQuestion = 'What is more challenging for LLM app developers?';

  let chatHistory = [] as BaseMessage[] | string;
  console.log('retrieving...');
  console.time('retrieval');
  let chatmodelOutput = await retrievalChain.invoke({
    input: firstQuestion,
    chat_history: chatHistory,
  });
  console.timeEnd('retrieval');

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

  console.log('follow up...');
  console.time('followup');
  let followUpOutput = await retrievalChain.invoke({
    input: followUpQuestion,
    chat_history: chatHistory,
  });

  console.timeEnd('followup');

  // Display
  console.log('From retrieval chain...', chatmodelOutput, '-----\n');
  console.log(
    'Follow up query with chat histroy...\n',
    followUpOutput,
    '-----\n'
  );

  console.log('---- Chroma Store end ---- \n\n');
}
