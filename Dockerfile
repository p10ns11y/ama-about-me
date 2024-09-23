FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY bun.lockb ./

COPY src ./

RUN bun install

CMD bun ama.ts
