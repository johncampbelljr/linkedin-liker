# Use Node with Puppeteer dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:latest

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy your project files (scripts, cookies)
COPY . .

# Run the script
CMD ["node", "liker.js"]