module.exports = {
    Query: {
        Atmospheres: async (_, __, { dataSources }) => {
            return await dataSources.atmosphereAPI.getAtmospheres();
        },
        openGarageDoor: async(_, __, { dataSources, pubsub }) => {
            return await dataSources.piAPI.openGarageDoor(pubsub);
        },
        closeGarageDoor: async(_, __, { dataSources, pubsub }) => {
            return await dataSources.piAPI.closeGarageDoor(pubsub);
        },
    },
    Subscription: {
        doorStatus: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('DOOR_STATUS')
        }
    }
  };