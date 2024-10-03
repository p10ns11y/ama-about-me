let availableFeatures = {
  retrieveUsingInMemory: (await import('./in-memory-vectorstore'))
    .retrieveUsingInMemory,
  chatAboutDocumentsContent: (await import('./chat-about-documents-content'))
    .chatAboutDocumentsContent,
};

type Features = keyof typeof availableFeatures;

// Better rename it to run or checkAndRun
export async function check(...features: Features[]) {
  for (let feature of features) {
    void availableFeatures?.[feature]?.();
  }
}
