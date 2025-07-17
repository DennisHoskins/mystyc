# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /api

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

RUN ls -la node_modules/ | head -20
RUN npm list stripe

# Copy the rest of the app
COPY . .

# Expose app port
EXPOSE 3000

# Allocate memory
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Run the app
CMD ["npm", "run", "start"]