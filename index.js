require('dotenv').config()

const { ApolloServer } = require('apollo-server')
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

const dataSources = () => ({
  userAPI: new UserAPI({ store }),
  atmosphereAPI: new AtmosphereAPI({ store }),
  alertAPI: new AlertAPI({ store }),
  deviceAPI: new DeviceAPI({ store }),
  piAPI: new PiAPI({ store, piManager }),
  alarmAPI: new AlarmAPI({ store, alarm }),
})

const context = ({ req, res }) => ({ req, res, pubsub })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
  cors: true,
  introspection: true,
  playground: true,
  engine: {
    apiKey: process.env.ENGINE_API_KEY,
  },
})

alarm.setAlarmState('DISARM')

if (process.env.NODE_ENV !== 'test') {
  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Launch time!!! ${url}`)
  })
}

module.exports = {
  dataSources,
  typeDefs,
  resolvers,
  ApolloServer,
  store,
  server,
  context,
}
