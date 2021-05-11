const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const http = require('http')
const { ApolloServer } = require('apollo-server-express')
const { RedisPubSub } = require('graphql-redis-subscriptions')
const Redis = require('ioredis')
const webPush = require('web-push')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { createStore } = require('./store')

const AlarmAPI = require('./datasources/alarm')
const AtmosphereAPI = require('./datasources/atmosphere')
const AlertAPI = require('./datasources/alert')
const DeviceAPI = require('./datasources/device')
const UserAPI = require('./datasources/user')
const PiAPI = require('./datasources/pi')
const SubscriptionAPI = require('./datasources/subscription')

const DeviceManager = require('./devices/device-manager')
const Alarm = require('./alarm')
const Messages = require('./messages')

const store = createStore()

const pubsub = new RedisPubSub({
  publisher: new Redis({
    host: process.env.REDIS_DOMAIN_NAME,
  }),
  subscriber: new Redis({
    host: process.env.REDIS_DOMAIN_NAME,
  }),
})

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
}

webPush.setVapidDetails(
  'mailto:steven@beeching.me',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const messages = new Messages({ store, webPush })
const deviceManager = new DeviceManager({ pubsub, store })
const alarm = new Alarm({ pubsub, store, deviceManager, messages })
const userAPI = new UserAPI({ store })
const context = ({ req, res }) => ({ req, res, pubsub, deviceManager })

const configurations = {
  // Note: You may need sudo to run on port 443
  production: {
    ssl: process.env.SSL === 'true',
    port: parseInt(process.env.PORT),
    hostname: process.env.IP_ADDRESS,
    playground: process.env.PLAYGROUND === 'true',
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
  piAPI: new PiAPI({ store, deviceManager }),
  alarmAPI: new AlarmAPI({ store, alarm }),
  subscriptionAPI: new SubscriptionAPI({ store }),
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

const app = express()
apollo.applyMiddleware({ app })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors())

app.get('/', (req, res) => {
  res.send(
    '<html><p>Remember what your Mumma said, read the books your father read.</p></html>'
  )
})

const server = http.createServer(app)

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
