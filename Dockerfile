# Use a lightweight Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies (production by default, dev if needed)
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose the app port
EXPOSE 3000

# Use npm dev mode with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
