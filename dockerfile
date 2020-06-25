FROM node:lts

# Set work directory to /app
WORKDIR /app

# Copy required files to build application
COPY src src
#COPY package-lock.json .
COPY package*.json ./

# Install dependencies
RUN npm install

COPY .env .

EXPOSE 443

# Execute application
CMD [ "node", "src/index.js" ]
