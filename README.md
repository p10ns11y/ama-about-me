# Ask Me Anything About Me

A personal chatbot that answers questions about me using Retrieval-Augmented Generation (RAG) with local documents. This project demonstrates a cost-effective approach to building LLM applications using free and open-source tools.

## Overview

This is an "Ask Me Anything" (AMA) chatbot built with TypeScript and LangChain. It loads personal documents (texts and PDFs), creates vector embeddings using Ollama, stores them in Chroma vector database, and answers questions using Groq's fast inference API. The entire setup runs locally with no API costs beyond initial setup.

## Key Features

- **Cost-Effective Architecture**: Uses free services (Ollama, Chroma, Groq) instead of paid APIs
- **Local First**: Embeddings and vector storage run entirely on your machine
- **Multi-Document Support**: Loads from both text files and PDFs
- **Contextual Compression**: Uses LLM-based document compression for better retrieval
- **Chat History Support**: Maintains conversation context for follow-up questions
- **Docker Ready**: Containerized for easy deployment and development
- **Web Interface**: React-based web application with real-time streaming

## Unusual Approaches & Innovations

### 1. Cost-Free LLM Stack
Instead of using OpenAI's paid API (common in tutorials), this project uses:
- **Ollama** for local embeddings (mxbai-embed-large model)
- **Groq** for chat inference (free tier for hobby projects)
- **Chroma** as vector database (runs locally)

### 2. Intentional Learning Through Struggle
Built without taking LangChain.js courses first - learned by reading documentation and source code directly. This "intensional struggling" approach helped gain deeper understanding of the internals.

### 3. Containerized Development Environment
- Uses Docker Compose to orchestrate Ollama and Chroma services
- Bun runtime for fast TypeScript execution
- Multi-stage builds optimized for development and production

### 4. Advanced Retrieval Techniques
- Contextual compression using LLM chain extractors
- Recursive text splitting with overlap
- Custom PDF loading with pdf-dist (handles large documents)

### 5. Web Application with React 19 Beta
- **Server-Sent Events (SSE)** for real-time streaming updates
- **React Server Components** using Bun's built-in server
- **AsyncLocalStorage** for request-scoped data management
- **Template tags** for SSE event generation
- **Real-time Q&A interface** with color-coded responses

## Technology Stack

### Core Libraries
- **LangChain.js**: Framework for building LLM applications
- **TypeScript**: Type-safe development
- **Bun**: Fast JavaScript runtime and package manager

### AI/ML Components
- **Ollama**: Local LLM inference and embeddings
- **Chroma**: Vector database for similarity search
- **Groq**: Fast chat model inference (Mixtral 8x7B)

### Infrastructure
- **Docker & Docker Compose**: Container orchestration
- **GitHub Actions**: CI/CD automation

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js/Bun for local development
- Ollama installed (for local embedding)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/p10ns11y/ama-about-me.git
cd ama-about-me
```

2. Install dependencies:
```bash
bun install
```

3. Start the infrastructure:
```bash
docker-compose -f compose-infra.yaml up -d
```

4. Run the application:
```bash
bun run dev
```

### Development Scripts

- `bun run dev` - Run the main chatbot application
- `bun run dev:server` - Start the HTTP server version
- `bun run dev:docker` - Run inside Docker container
- `bun run node:dev` - Run with Node.js instead of Bun

## Project Structure

```
src/
├── ama.ts                 # Main application entry point
├── chat-about-documents-content.ts  # Core RAG implementation
├── chroma-vectorstore.ts  # Vector store configuration
├── setup-ollama.ts        # Ollama initialization
├── helpers/
│   └── file-utils.ts      # File system utilities
└── data/
    ├── texts/             # Text documents for knowledge base
    └── pdfs/              # PDF documents
```

## Architecture

1. **Document Loading**: Uses LangChain's DirectoryLoader to load multiple file types
2. **Text Splitting**: RecursiveCharacterTextSplitter with configurable chunk size and overlap
3. **Embedding**: Ollama generates embeddings for document chunks
4. **Vector Storage**: Chroma stores embeddings for similarity search
5. **Retrieval**: ContextualCompressionRetriever with LLM-based compression
6. **Generation**: Groq's Mixtral model generates answers based on retrieved context

## Configuration

Environment variables:
- `BASE_OLLAMA_URL` - Ollama server URL (for Docker environments)

## Learning Journey

This project was built as a self-learning exercise following completion of the "LangChain Chat with Your Data" course on DeepLearning.AI. Key learnings:

- RAG (Retrieval-Augmented Generation) patterns
- Vector databases and similarity search
- Local LLM deployment with Ollama
- Cost-effective AI application development
- Container orchestration for AI services

## Future Roadmap

- [ ] Web interface with React 19
- [ ] Support for additional document types
- [ ] Voice input/output capabilities
- [ ] Advanced memory management
- [ ] GPU optimization for Ollama
- [ ] Multi-user support

## Contributing

This is a personal project, but feel free to open issues or submit pull requests for improvements.

## License

[Choose a license](https://choosealicense.com/licenses/) - Currently unlicensed.

## Acknowledgments

- [LangChain](https://js.langchain.com/) for the LLM framework
- [Ollama](https://ollama.com/) for local AI models
- [Groq](https://groq.com/) for fast inference
- [Chroma](https://docs.trychroma.com/) for vector storage
- DeepLearning.AI for the foundational course

## Author

Peramanathan Sathyamoorthy - Building AI applications through intentional learning
