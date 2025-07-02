# 1. Use official Node.js base image
FROM node:18

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Build TypeScript to JavaScript (optional if pre-compiling)
# RUN npm run build

# 7. Expose port
EXPOSE 5001

# 8. Start the server
CMD ["npm", "run", "dev"]
