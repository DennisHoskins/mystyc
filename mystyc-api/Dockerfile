# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /api

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose app port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]