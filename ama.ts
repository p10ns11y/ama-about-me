import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OllamaEmbeddings } from '@langchain/ollama';

import './initialize';

import { retrieveUsingInMemory } from './in-memory-vectorstore';
import { retrieveUsingChroma } from './chroma-vectorstore';

async function main() {
  // Load some documents' content (step1: keep it simple)
  let textContentLoader = new TextLoader(
    './data/texts/history-of-programming.txt'
  );
  let documents = await textContentLoader.load();

  // Split content,
  let recursiveSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 25,
  });

  let splittedDocuments = await recursiveSplitter.splitDocuments(documents);

  // // Do embedding and store them in vector store
  let embeddings = new OllamaEmbeddings({});

  await retrieveUsingInMemory(embeddings, splittedDocuments);

  // Load multiple different docuemnts
  let directoryLoader = new DirectoryLoader('./data/pdfs', {
    '.pdf': (path: string) =>
      new PDFLoader(path, {
        parsedItemSeparator: '',
        pdfjs: () =>
          // @ts-ignore no type defs for pdf-dist yet
          import('pdf-dist/build/pdf.js').then((module) => module.default),
      }),
  });

  let pdfDocuments = await directoryLoader.load();
  // TODO: Use another splitter with big chunk size
  let splittedPdfDocuments = await recursiveSplitter.splitDocuments(
    pdfDocuments
  );

  await retrieveUsingChroma(embeddings, splittedPdfDocuments);
}

main();
