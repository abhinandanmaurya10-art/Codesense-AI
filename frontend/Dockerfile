FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG NITRO_PRESET=node-server
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV NITRO_PRESET=${NITRO_PRESET}

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend ./
RUN bun run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
