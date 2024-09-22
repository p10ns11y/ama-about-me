import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TextLoader } from 'langchain/document_loaders/fs/text';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { ChatGroq } from '@langchain/groq';

import type { BaseMessage } from '@langchain/core/messages';

import { getEmbeddings } from './embedding';

import { getDirectoryName } from './helpers/file-utils';

let embeddingsPromise = getEmbeddings();

export async function retrieveUsingInMemory() {
  console.log('\n---- In Memory Store start ----\n');
  // Load some documents' content (step1: keep it simple)
  let __dirname = await getDirectoryName({
    fileURL: import.meta.url,
  });

  let __filename = fileURLToPath(import.meta.url);

  let textContentLoader = new TextLoader(
    path.resolve(__dirname, 'data/texts/history-of-programming.txt')
  );
  let documents = await textContentLoader.load();

  // Split content,
  let recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 25,
  });

  let splittedDocuments = await recursiveSplitter.splitDocuments(documents);

  let embeddings = await embeddingsPromise;
  const vectorStore = new MemoryVectorStore(embeddings);

  // This also creates embeddings for these documents
  await vectorStore.addDocuments(splittedDocuments);

  let query = 'When and how programming started?';

  // Querying directly
  const similaritySearchResults = await vectorStore.similaritySearch(query, 2);

  for (const doc of similaritySearchResults) {
    console.log(
      __filename,
      `\n similarity result for ${query}: ${doc.pageContent} \n`
    );
  }

  // Retrieval
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
    similarityRetriever.invoke(query),
    maximumMarginalRelevanceRetriever.invoke(query),
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

  let firstQuestion = 'One sentence for the evolution of programming';

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
      'There are so many buzz and threatful articles and news',
    ],
  ] as BaseMessage[];

  let followUpQuestion =
    'Will programming be still important skill, say in 2 years, given there are so much negative news floating around?';

  let followUpOutput = await retrievalChain.invoke({
    input: followUpQuestion,
    chat_history: chatHistory,
  });

  // Display
  console.log(
    __filename,
    '\nFrom simple retrievers (similarityRetriever, maximumMarginalRelevanceRetriever)...\n',
    result.flat().map((contentList) => contentList.pageContent),
    '\n-----\n'
  );
  console.log(
    __filename,
    'From retrieval chain...\n',
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
    'Follow up query with chat history...\n',
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

  console.log(__filename, '---- In Memory Store end ---- \n\n');
}
