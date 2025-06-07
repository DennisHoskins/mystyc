# Use official Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /web

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install ts-node so `npm run swEnvBuild` can find it
RUN npm install ts-node

# Copy the rest of the app
COPY . .

# Build service worker .env
RUN npm run swEnvBuild

# Build the app
RUN npm run build

# Expose app port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
