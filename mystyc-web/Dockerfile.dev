FROM node:22

WORKDIR /web

ENV NODE_OPTIONS="--max-old-space-size=3072"

# Copy package files only (to cache deps install)
COPY mystyc-web/package*.json ./

# Copy shared lib package.json and link it after install (if needed)
COPY mystyc-common/package.json ../mystyc-common/

RUN npm install

# Copy full source AFTER install for dev mode live mount
COPY mystyc-web/ ./
COPY mystyc-common/ ../mystyc-common/

EXPOSE 3000

CMD ["npm", "run", "dev"]
