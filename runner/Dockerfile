# Holiday Hue runner — runs on the umbrel box. Publishes NO ports: it only makes
# outbound calls (AppSync over the internet, the Hue bridge on the LAN).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --no-audit --no-fund && npm i -g tsx@4 --no-audit --no-fund
COPY amplify/data/resource.ts amplify/data/resource.ts
COPY src/domain src/domain
COPY runner runner
ARG RUNNER_VERSION=dev
ENV RUNNER_VERSION=$RUNNER_VERSION
USER node
CMD ["tsx", "runner/main.ts"]
