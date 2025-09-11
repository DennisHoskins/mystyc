FROM node:20

# Install Python and build tools for Swiss Ephemeris
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment variable for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /api

COPY mystyc-common/package*.json /mystyc-common/
COPY mystyc-common/tsconfig.json /mystyc-common/
COPY mystyc-common/src /mystyc-common/src
RUN cd /mystyc-common && npm install && npm run build && npm link

COPY mystyc-server/package*.json ./
RUN npm cache clean --force
RUN npm install
RUN npm link mystyc-common

COPY mystyc-server/ ./
# Ensure swisseph is rebuilt for this environment
RUN npm rebuild swisseph

ENV NODE_OPTIONS="--max-old-space-size=3072"
EXPOSE 3001
CMD ["npm", "run", "start:dev"]