import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';

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

import { getChromaVectorStore } from './chroma-vectorstore';
import { getDirectoryName } from './helpers/file-utils';

type Options = {
  getVectorStore?: (options?: { cache: boolean }) => Promise<Chroma>;
};

export async function chatAboutDocumentsContent(options: Options = {}) {
  let { getVectorStore = getChromaVectorStore } = options;

  let __filename = fileURLToPath(import.meta.url);

  console.log(__filename, '\n---- Chroma Store start ---- \n\n');

  // Load some documents' content (step1: keep it simple)
  let __dirname = await getDirectoryName({
    fileURL: import.meta.url,
  });

  // Load multiple different docuemnts
  let directoryLoader = new DirectoryLoader(
    path.resolve(__dirname, 'data/texts'),
    {
      // when embedding pdf documents contents via containerized ollama timeout occurs
      '.pdf': (path: string) =>
        new PDFLoader(path, {
          parsedItemSeparator: '\n',
          splitPages: true,
          pdfjs: () =>
            // @ts-ignore no type defs for pdf-dist yet
            import('pdf-dist/build/pdf.js').then((module) => module.default),
        }),
      '.txt': (path: string) => new TextLoader(path),
    }
  );

  let recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });

  let textDocuments = await directoryLoader.load();

  console.log(__filename, 'total TextDocuments', textDocuments.length);
  // Default get the cached vectorstore
  let documentsVectorStore = await getVectorStore({
    cache: false,
    collectionName: 'text-document-content-collections',
  });
  let splittedTextDocuments = await recursiveSplitter.splitDocuments(
    textDocuments
  );

  console.log(
    __filename,
    '\ntotal splittedTextDocuments',
    splittedTextDocuments.length
  );

  console.log(__filename, '\n---- Adding and embedding documents ---- \n\n');

  console.time('add and embed documents');
  if (process.env.BASE_OLLAMA_URL) {
    // When run via docker timeout occurs when there are so much tex segments
    await documentsVectorStore.addDocuments(splittedTextDocuments.slice(0, 10));
  } else {
    await documentsVectorStore.addDocuments(splittedTextDocuments);
  }
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

  let firstQuestion = 'What are important skills for programmers?';

  let compressedDocs = await contextualRetriver.invoke(firstQuestion);

  console.log(
    __filename,
    '\ncompressed and contextual relevant documents\n',
    compressedDocs.map((contentList) => contentList.pageContent),
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

  let chatHistory = [] as BaseMessage[] | string;
  console.log(__filename, '\nretrieving...\n');
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
      'There are so many buzz and threatful articles and news',
    ],
  ] as BaseMessage[];

  let followUpQuestion =
    'What are the best adaptation strategies for developers ?';

  console.log(__filename, '\nfollow up...\n');
  console.time('followup');
  let followUpOutput = await retrievalChain.invoke({
    input: followUpQuestion,
    chat_history: chatHistory,
  });
  console.timeEnd('followup');

  // Display
  console.log(
    __filename,
    '\nFrom retrieval chain...\n',
    {
      input: chatmodelOutput.input,
      result: chatmodelOutput.context.map(
        (contentList) => contentList.pageContent
      ),
      answer: chatmodelOutput.answer,
    },
    '\n-----\n'
  );
  console.log(
    __filename,
    '\nFollow up query with chat history...\n',
    {
      input: followUpOutput.input,
      chat_history: followUpOutput.chat_history,
      result: followUpOutput.context.map(
        (contentList) => contentList.pageContent
      ),
      answer: followUpOutput.answer,
    },
    '\n-----\n'
  );

  console.log(__filename, '\n---- Chroma Store end ---- \n\n');
}
