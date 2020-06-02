module.exports = {
    Query: {
        atmospheres: async (_, __, { dataSources }) => {
            return await dataSources.atmosphereAPI.getAtmospheres();
        },
        alerts: async (_, __, { dataSources }) => {
            return await dataSources.alertAPI.getAlerts();
        },
        devices: async (_, __, { dataSources }) => {
            return await dataSources.deviceAPI.getDevices();
        },
        getAlarmDevices: async (_, __, { dataSources }) => {
            return await dataSources.deviceAPI.getAlarmDevices();
        },
        openGarageDoor: async(_, __, { dataSources, pubsub }) => {
            return await dataSources.piAPI.openGarageDoor(pubsub);
        },
        closeGarageDoor: async(_, __, { dataSources, pubsub }) => {
            return await dataSources.piAPI.closeGarageDoor(pubsub);
        },
    },
    Mutation: {
        devicePulse: async(_, args, { dataSources, pubsub }) => {
            return await dataSources.piAPI.devicePulse(args.id);
        },
    },
    Subscription: {
        doorStatus: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('DOOR_STATUS')
        },
        alarmStatus: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALARM_STATUS')
        },
        alert: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALERT')
        }
    }
  };