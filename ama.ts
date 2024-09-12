import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OllamaEmbeddings } from '@langchain/ollama';

import './initialize';

import { retrieveUsingInMemory } from './in-memory-vectorstore';
import { retrieveUsingChroma } from './chroma-vectorstore';

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

  // Do embedding and store them in vector store
  let embeddings = new OllamaEmbeddings({});

  await retrieveUsingInMemory(embeddings, splittedDocuments);
  await retrieveUsingChroma(embeddings, splittedDocuments);

  // TODO: Send the user question with retrived documents, chat history to ChatModels

  // Display
}

main();
