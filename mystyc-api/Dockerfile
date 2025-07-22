FROM node:20-alpine

WORKDIR /api

COPY mystyc-common/package*.json /mystyc-common/
COPY mystyc-common/tsconfig.json /mystyc-common/
COPY mystyc-common/src /mystyc-common/src
RUN cd /mystyc-common && npm install && npm run build && npm link

COPY mystyc-api/package*.json ./
RUN npm install
RUN npm link mystyc-common

COPY mystyc-api/ ./

ENV NODE_OPTIONS="--max-old-space-size=3072"
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
