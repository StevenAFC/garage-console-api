const { paginateResults } = require('./utils'); 

module.exports = {
    Query: {
        Atmospheres: async (_, __, { dataSources }) => {
            return await dataSources.atmosphereAPI.getAtmospheres();
        }
    },
    Mutation: {

    },
  };