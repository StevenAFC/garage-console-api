require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const isEmail = require('isemail');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { createStore } = require('./utils');

const AtmosphereAPI = require('./datasources/atmosphere');
const PiAPI = require('./datasources/pi');

const store = createStore();

const dataSources = () => ({
    atmosphereAPI: new AtmosphereAPI({ store }),
    piAPI: new PiAPI()
});

const context = async ({ req }) => {
  // simple auth check on every request
  //const auth = (req.headers && req.headers.authorization) || '';
  //const email = new Buffer(auth, 'base64').toString('ascii');

  // if the email isn't formatted validly, return null for user
  //if (!isEmail.validate(email)) return { user: null };
  // find a user by their email
  //const users = await store.users.findOrCreate({ where: { email } });
  //const user = users && users[0] ? users[0] : null;

  //return { user };
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context,
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
    context,
    typeDefs,
    resolvers,
    ApolloServer,
    store,
    server,
};