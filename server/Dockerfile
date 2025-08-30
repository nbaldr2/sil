# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    openssl

# Copy package files
COPY package*.json ./

# Install all dependencies first (needed for Prisma generation)
RUN npm ci

# Copy Prisma schema first
COPY prisma ./prisma/
COPY schema.prod.prisma ./prisma/schema.prisma

# Generate Prisma client
RUN npx prisma generate

# Remove dev dependencies after Prisma generation
RUN npm prune --production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs/audit

# Create backups directory
RUN mkdir -p backups

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]