FROM node:22

WORKDIR /web

ENV NODE_OPTIONS="--max-old-space-size=3072"

# Copy package files only (to cache deps install)
COPY mystyc-web/package*.json ./

# Copy shared lib package.json
COPY mystyc-common/package.json ../mystyc-common/

RUN npm install

# Copy full source
COPY mystyc-web/ ./
COPY mystyc-common/ ../mystyc-common/

# Build the Next.js app for production
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]