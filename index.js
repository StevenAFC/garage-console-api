require('dotenv').config();

const { ApolloServer, PubSub } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { createStore } = require('./utils');

const AtmosphereAPI = require('./datasources/atmosphere');
const AlertAPI = require('./datasources/alert');
const DeviceAPI = require('./datasources/device');
const PiAPI = require('./datasources/pi');

const PiManager = require('./pi-manager');
const Alarm = require('./alarm');

const store = createStore();

const pubsub = new PubSub();

alarm = new Alarm({pubsub, store});

piManager = new PiManager({pubsub, store, alarm});
piManager.initialise();

const dataSources = () => ({
    atmosphereAPI: new AtmosphereAPI({ store }),
    alertAPI: new AlertAPI({ store }),
    deviceAPI: new DeviceAPI({ store }),
    piAPI: new PiAPI({ piManager })
});

const context = ({ req, res }) => ({req, res, pubsub })

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
    }
});

if (process.env.NODE_ENV !== 'test') {
    server
        .listen({ port: process.env.PORT || 4000 })
        .then(({ url }) => {
            console.log(`Launch time!!! ${url}`)
        });
}

module.exports = {
    dataSources,
    typeDefs,
    resolvers,
    ApolloServer,
    store,
    server,
    context
};