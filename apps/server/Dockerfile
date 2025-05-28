# Use the official Node.js 20 runtime
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Copy firebase service account
COPY firebase-service-account.json ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Set environment variables (PORT is automatically set by Cloud Run)
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]