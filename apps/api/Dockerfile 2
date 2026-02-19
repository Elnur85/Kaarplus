FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package.json and workspace package.json files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Install dependencies (ignoring scripts initially to avoid prisma errors)
RUN npm ci --workspace=apps/api --workspace=@kaarplus/database --include-workspace-root

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema packages/database/prisma/schema.prisma

# Build the API
RUN npm run build --workspace=apps/api

# Expose port
EXPOSE 4000

# Set production env
ENV NODE_ENV=production

# Start the server
CMD ["node", "apps/api/dist/index.js"]
