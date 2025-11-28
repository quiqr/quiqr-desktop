# Quiqr Desktop - Standalone Server
# Proof of Concept Dockerfile

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY packages/backend/package*.json ./packages/backend/
COPY packages/adapters/standalone/package*.json ./packages/adapters/standalone/

# Install dependencies (this will handle all workspaces)
RUN npm install

# Copy source code for all required packages (BEFORE building!)
COPY tsconfig.base.json ./
COPY packages/types/ ./packages/types/
COPY packages/backend/ ./packages/backend/
COPY packages/adapters/standalone/ ./packages/adapters/standalone/

# Copy resources folder (contains Hugo binaries, Git binaries, etc.)
COPY resources/ ./resources/

# Build only the packages we need (types, backend, standalone)
RUN npm run build -w @quiqr/types && \
    npm run build -w @quiqr/backend && \
    npm run build -w @quiqr/adapter-standalone

# Expose the backend API port
EXPOSE 5150

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5150

# Start the standalone server
CMD ["npm", "run", "start", "-w", "@quiqr/adapter-standalone"]
