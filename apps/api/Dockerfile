FROM node:20-alpine

# Install build dependencies for native modules (like bcrypt)
# Alpine needs these to compile C++ modules and for Prisma
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

# Copy root package.json and lockfile
COPY package*.json ./

# Copy workspace package.json files and Prisma schema
# This allows npm ci to see the workspace structure and generate the database client
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/database/prisma/schema.prisma ./packages/database/prisma/

# Install dependencies for the API and Database workspaces
RUN npm ci --workspace=apps/api --workspace=@kaarplus/database --include-workspace-root

# Copy the rest of the source code
COPY . .

# Build the API (TypeScript compilation)
RUN npm run build --workspace=apps/api

# Set environment
ENV NODE_ENV=production
EXPOSE 4000

# Start the application
CMD ["node", "apps/api/dist/index.js"]
