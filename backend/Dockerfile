# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start:prod"]
