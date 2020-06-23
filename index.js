require('dotenv').config()

const express = require('express')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { ApolloServer } = require('apollo-server-express')
const { RedisPubSub } = require('graphql-redis-subscriptions')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { createStore } = require('./store')

const AlarmAPI = require('./datasources/alarm')
const AtmosphereAPI = require('./datasources/atmosphere')
const AlertAPI = require('./datasources/alert')
const DeviceAPI = require('./datasources/device')
const UserAPI = require('./datasources/user')
const PiAPI = require('./datasources/pi')

const PiManager = require('./pi-manager')
const Alarm = require('./alarm')

const store = createStore()
const pubsub = new RedisPubSub()
const piManager = new PiManager({ pubsub, store })
const alarm = new Alarm({ pubsub, store, piManager })
alarm.initialise()
const userAPI = new UserAPI({ store })
const context = ({ req, res }) => ({ req, res, pubsub })

const configurations = {
  // Note: You may need sudo to run on port 443
  production: {
    ssl: true,
    port: 443,
    hostname: '77.98.107.162',
    playground: true,
  },
  development: {
    ssl: false,
    port: 4000,
    hostname: 'localhost',
    playground: true,
  },
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

const dataSources = () => ({
  userAPI,
  atmosphereAPI: new AtmosphereAPI({ store }),
  alertAPI: new AlertAPI({ store }),
  deviceAPI: new DeviceAPI({ store }),
  piAPI: new PiAPI({ store, piManager }),
  alarmAPI: new AlarmAPI({ store, alarm }),
})

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
  cors: true,
  introspection: true,
  playground: config.playground,
  subscriptions: {
    onConnect: (connectionParams) => {
      if (connectionParams.token) {
        return userAPI.authenticate(connectionParams.token)
      }
      throw new Error('Missing authentication token')
    },
  },
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
  },
})

alarm.setAlarmState('DISARM')

const app = express()
apollo.applyMiddleware({ app })

var server
if (config.ssl) {
  server = https.createServer(
    {
      key: fs.readFileSync(`./ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./ssl/${environment}/server.cert`),
    },
    app
  )
} else {
  server = http.createServer(app)
}

apollo.installSubscriptionHandlers(server)

server.listen({ port: config.port }, () =>
  console.log(
    '🚀 Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${
      apollo.graphqlPath
    }`
  )
)

module.exports = {
  dataSources,
  typeDefs,
  resolvers,
  apollo,
  store,
  server,
  context,
}
