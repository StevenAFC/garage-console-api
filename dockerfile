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

EXPOSE 6666
EXPOSE 6667
EXPOSE 6668

# Execute application
CMD [ "node", "src/index.js" ]
