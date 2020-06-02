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
        alarmDevices: async (_, __, { dataSources }) => {
            return await dataSources.deviceAPI.alarmDevices();
        },
        alarmStatus: async (_, __, { dataSources }) => {
            return await dataSources.alarmAPI.getAlarmState();
        },
    },
    Mutation: {
        devicePulse: async(_, args, { dataSources }) => {
            return await dataSources.piAPI.devicePulse(args.id);
        },
        alarmState: async(_, args, { dataSources }) => {
            return await dataSources.alarmAPI.setAlarmState(args.state);
        },
    },
    Subscription: {
        alarmStatus: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALARM_STATUS')
        },
        alarmDevices: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALARM_DEVICES')
        }
    }
  };