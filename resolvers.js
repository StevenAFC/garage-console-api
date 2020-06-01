module.exports = {
    Query: {
        Atmospheres: async (_, __, { dataSources }) => {
            return await dataSources.atmosphereAPI.getAtmospheres();
        },
        openGarageDoor: async(_, __, { dataSources, pubsub }) => {
            return await dataSources.piAPI.openGarageDoor(pubsub);
        },
    },
    Subscription: {
        something: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('SUBSCRIBE')
        }
    }
  };