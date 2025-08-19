FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and .gitignore
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 