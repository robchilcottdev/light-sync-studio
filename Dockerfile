# Use a standard Node image instead of the HA BUILD_FROM
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the Ingress port
EXPOSE 8099

# Run Node directly
CMD [ "node", "server.js" ]