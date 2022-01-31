FROM node:latest

# Set work directory to /app
WORKDIR /app

#COPY package-lock.json .
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies
RUN npm install --production

# Copy required files to build application
COPY src src

EXPOSE 4000

# Execute application
CMD [ "node", "src/index.js" ]
