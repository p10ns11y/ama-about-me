import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OllamaEmbeddings } from '@langchain/ollama';

import './initialize';
// let OPENAI_API_KEY = '';
// let LANGCHAIN_API_KEY = '';

async function main() {
  // Load some documents' content (step1: keep it simple)
  let textContentLoader = new TextLoader('./history-of-programming.txt');
  let documents = await textContentLoader.load();

  // Split content,
  let recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 25,
  });

  let splittedDocuments = await recursiveSplitter.splitDocuments(documents);

  // console.log(splittedDocuments);
  // Do embedding and store them in vector store
  let embeddings = new OllamaEmbeddings({});

  // To see how embedding looks
  // let embeddedDocumentsVector = await embeddings.embedDocuments(
  //   splittedDocuments
  // );

  const vectorStore = new MemoryVectorStore(embeddings);

  // This also creates embeddings for these documents
  await vectorStore.addDocuments(splittedDocuments);

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
}

main();
