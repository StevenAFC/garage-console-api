FROM node:lts

# Set work directory to /app
WORKDIR /app

#COPY package-lock.json .
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy required files to build application
COPY src src
COPY .env .

# Execute application
CMD [ "node", "src/index.js" ]
