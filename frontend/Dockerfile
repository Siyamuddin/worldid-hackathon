FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables (use ARG for build-time, ENV for runtime)
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_WORLDID_APP_ID=app_staging_123
ARG VITE_WORLDID_ACTION=worldid-reward-claim

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WORLDID_APP_ID=$VITE_WORLDID_APP_ID
ENV VITE_WORLDID_ACTION=$VITE_WORLDID_ACTION

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
