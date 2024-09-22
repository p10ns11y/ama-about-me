// import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import './initialize';

import { setupOllama } from './setup-ollama';
import { check } from './check.ts';

async function main() {
  console.log('main....');
  console.log('waiting for ollama....');
  let status = await setupOllama();
  console.log('ollama status is', status);

  await check('retrieveUsingInMemory', 'chatAboutDocumentsContent');
}

main();
