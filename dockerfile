FROM node:lts

# Set work directory to /app
WORKDIR /app

# Copy required files to build application
COPY src src
#COPY package-lock.json .
COPY package*.json ./

COPY .env .

# Install dependencies
RUN npm install

# Execute application
CMD [ "node", "src/index.js" ]
