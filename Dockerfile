# frontend/Dockerfile
FROM node:22

WORKDIR /app

# Build arguments
ARG VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variable for build
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Install serve globally to serve static files
RUN npm install -g serve

EXPOSE 5004

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "5004"]
