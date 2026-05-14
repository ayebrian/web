FROM --platform=$BUILDPLATFORM oven/bun:alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache git
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000
CMD ["bun", "start:standalone"]
