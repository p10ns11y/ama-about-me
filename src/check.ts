let availableFeatures = {
  retrieveUsingInMemory: (await import('./in-memory-vectorstore'))
    .retrieveUsingInMemory,
  chatAboutDocumentsContent: (await import('./chat-about-documents-content'))
    .chatAboutDocumentsContent,
};

type Features = keyof typeof availableFeatures;

export async function check(...features: Features[]) {
  for (let feature of features) {
    void availableFeatures?.[feature]?.();
  }
}
