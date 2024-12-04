# Use Node.js 16 as the base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Install nodemon globally for auto-reloading during development
RUN npm install -g nodemon

# Copy the rest of the backend code
COPY . .

# Expose the port your app runs on
EXPOSE 5001

# Start the application using nodemon
CMD ["nodemon", "app.js"]

