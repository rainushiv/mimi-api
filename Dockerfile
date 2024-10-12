# Comment
# Use Node 20.16 alpine as base image
FROM node:20.16-alpine3.19 AS base



# Copy the package.json and package-lock.json files to the /build directory
# Use a Node.js base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app listens on
EXPOSE 4000 

# Start the application
CMD ["npm", "start"]