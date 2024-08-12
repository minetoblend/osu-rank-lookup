FROM node:22.6-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json /app/
COPY pnpm-lock.yaml /app/

RUN pnpm install

COPY . .

ENTRYPOINT [ "pnpm", "start" ]