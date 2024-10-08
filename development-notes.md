## Ask Me Anything About Me (AMA-about-me)

After completing `Langchain chat with your data` (uses ipython jupyter notebook) where I learned basics and fundamentals for LLM apps, I wanted to build simple app using TypeScript without taking any other course and just by reading docs and source with **intensional struggling**. I plan to take the other course which actually uses langchain.js later. Also I wanted to build it cost-effective (0 dollors so far) using free models and free plans of the services. Instead OpenAPI I am using Ollama for embedding, Chroma as vector store those runs locally in the machine and `Groq` for `chatmodels` (llm+chat) which has free plan for hobby project. Those are not mentioned in the courses and figured out myself.

### Sing-off

Using it only on web so that I will know which I committed from laptop and
Which are committed directly on Github

### Done

- [x] Found langchain deeplearning.ai and learned core concepts
- [x] Completed a short course about creating a chat bot with personal/local data
- [x] Set up typescript project and figured out the structure of the library
- [x] Coded loading and splitting
- [x] Learned about ollama and it is free
- [x] Setup ollama locally
- [x] Embed and create vector store
- [x] Retrieve using in-memory and Chroma db
- [x] Feed retrieval chain to LLMs and did question and got answer
- [x] Asked followup with chat history
- [x] Displayed result
- [x] Load multiple documents (PDFs)
- [ ] - Dev environment
  - [x] Docker
  - [x] Docker-compose (ollama, chroma)

### TODOs

- [ ] Load different types of documents
  - [ ] PDFs, text files, web pages (publicly available and sharable)
- [ ] Relevant Memoirs text
- [ ] Frequently asked questions
- [ ] No Personally Identifiable Information (PIIs) of others in the
      Answers
- [ ] Social handle links: x, insta, threads, fb (inactive, soon)
- [ ] When contact info requested such as mobile number, email (Show a form popup/modal or something, ask their contact info and reason and there will be a system where I can see such requests and click send if the person seems legit such as recruiters (linked-in profile) )

- Dev environment
  - [ ] Docker
  - [ ] Docker-compose (ollama, chroma)
  - [ ] Enable watch mode for changes and if needed, use multi-stage
- [ ] Automation: Github actions (simple)
- [ ] Infra level (terraform) - need paid api keys
- [ ] GPU optimization for ollama
- [ ] Transition from cli to Web application

  - [ ] Only one page react 19 app with QA support (use latest features whenever wherever it is applicable and introduce relevant link as needed)

- [ ] Image usage and creation\* (use limited existing or relevant images in the rendering result, expensive and protect against possible misuse)
- [ ] Speech to text (voice chat)

Advacned learning TODOs:

- [ ] Learn more about embedding (latent-positioning) mathematically (theoritical)

### References

https://v02.api.js.langchain.com/classes/_langchain_community.vectorstores_chroma.Chroma.html

https://ollama.com/library/mxbai-embed-large

https://js.langchain.com/v0.2/docs/integrations/vectorstores/memory

https://js.langchain.com/v0.2/docs/integrations/text_embedding/ollama/

https://js.langchain.com/v0.2/docs/integrations/vectorstores/chroma/

https://js.langchain.com/v0.2/docs/tutorials/rag

https://js.langchain.com/v0.2/docs/integrations/chat/

https://js.langchain.com/v0.2/docs/integrations/document_loaders/file_loaders/multi_file/

### Course completitions and accomplishments

[Langchain chat with your data (jupyter ipython notebook) course](https://learn.deeplearning.ai/courses/langchain-chat-with-your-data/lesson/1/introduction)

[Langchain chat with your data (completion certificate)](https://learn.deeplearning.ai/accomplishments/f72f24f1-9ad2-4bc0-b8c2-33cbecb81ec2?usp=sharing)

[Build llm apps with langchain js](https://learn.deeplearning.ai/courses/build-llm-apps-with-langchain-js/lesson/1/introduction) (will start soon)

### Services

- Groq for chatmodels (https://groq.com/)
- Ollama for embedding only for now (https://ollama.com/)
- Chroma for vectorstore (https://docs.trychroma.com/)
- Github Actions (https://github.com/actions)

- To choose project license (https://choosealicense.com/licenses/)
- To monitor langchain apps (https://smith.langchain.com/) (paid service)

### Research papers

- [Bi-temporal Timeline Index: A data structure for Processing Queries on bi-temporal data](https://www.researchgate.net/publication/282921787_Bi-temporal_Timeline_Index_A_data_structure_for_Processing_Queries_on_bi-temporal_data)

- [Temporal Aggregation of Spanning Event Stream: An Extended Framework to Handle the Many Stream Models](https://www.researchgate.net/publication/354241624_Temporal_Aggregation_of_Spanning_Event_Stream_An_Extended_Framework_to_Handle_the_Many_Stream_Models)
- [Temporal Data Structures for time travel - MIT Computer Science and Artificial Intelligence Laboratory](https://courses.csail.mit.edu/6.851/spring07/scribe/lec07.pdf)
- [Conversations in Time: Interactive Visualization to Explore Structured Temporal Data](https://rjournal.github.io/articles/RJ-2021-050/RJ-2021-050.pdf)
- [A new tidy data structure to support exploration and modeling of temporal data](https://arxiv.org/pdf/1901.10257v2)
