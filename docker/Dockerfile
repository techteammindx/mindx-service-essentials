FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000 5000

ENV NODE_ENV=production
ENV TRANSPORT_MODE=graphql

CMD ["pnpm", "start:prod"]
