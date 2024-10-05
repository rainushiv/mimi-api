# Comment
# Use Node 20.16 alpine as base image
FROM node:20.16-alpine3.19 AS base

WORKDIR /build


# Copy the package.json and package-lock.json files to the /build directory
COPY package*.json ./


# Install production dependencies and clean the cache
RUN npm ci --omit=dev && npm cache clean --force


# Copy the entire source code into the container
COPY . .


# Document the port that may need to be published
EXPOSE 4000


# Start the application
CMD ["node", "server.js"]

