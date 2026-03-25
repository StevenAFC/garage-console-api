FROM node:latest

# Set work directory to /app
WORKDIR /app

# Install Python and RF libraries
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install RPi.GPIO rpi-rf

#COPY package-lock.json .
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies
RUN npm install --production

# Copy required files to build application
COPY src src

EXPOSE 4000

# Execute application
CMD [ "node", "src/index.js" ]
