# Holiday Hue runner — runs on the umbrel box. Publishes NO ports: it only makes
# outbound calls (AppSync over the internet, the Hue bridge on the LAN).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --no-audit --no-fund && npm i --no-save tsx@4 >/dev/null
COPY amplify/data/resource.ts amplify/data/resource.ts
COPY src/domain src/domain
COPY runner runner
ARG RUNNER_VERSION=dev
ENV RUNNER_VERSION=$RUNNER_VERSION
USER node
CMD ["npx", "tsx", "runner/main.ts"]
