# Stage 1: Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build if using TypeScript (optional)
# RUN npm run build

# Expose the port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]
