FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p uploads && chown -R node:node /usr/src/app

COPY --chown=node:node . .

USER node
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1/health').then(async r => { const d = await r.json(); process.exit(r.ok && d.status === 'ok' && d.database === 'connected' ? 0 : 1); }).catch(() => process.exit(1))"

CMD ["npm", "start"]
