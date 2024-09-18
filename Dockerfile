FROM oven/bun:latest

WORKDIR /app

COPY .env ./
COPY package.json ./
COPY package-lock.json ./
COPY bun.lockb ./

COPY src ./

RUN bun install

EXPOSE 11434
# EXPOSE 8000
COPY  . /app

CMD bun ama.ts
