module.exports = {
  Query: {
    atmospheres: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.atmosphereAPI.getAtmospheres()
    },
    alerts: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.alertAPI.getAlerts()
    },
    devices: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.deviceAPI.getDevices()
    },
    outputDevices: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.deviceAPI.outputDevices()
    },
    alarmDevices: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.deviceAPI.alarmDevices()
    },
    alarmStatus: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.alarmAPI.getAlarmState()
    },
    piStatus: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.piAPI.getSystemStatus()
    },
    deviceStates: async (_, __, { req, dataSources, deviceManager }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await deviceManager.getDeviceStates()
    },
  },
  Mutation: {
    devicePulse: async (_, args, { req, dataSources, deviceManager }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await deviceManager.devicePulse(args.id)
    },
    alarmState: async (_, args, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.alarmAPI.setAlarmState(args.state)
    },
    login: async (_, args, { dataSources }) => {
      return await dataSources.userAPI.login(args)
    },
    register: async (_, args, { dataSources }) => {
      return await dataSources.userAPI.register(args)
    },
  },
  Subscription: {
    alarmStatus: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALARM_STATUS'),
    },
    alarmDevices: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('ALARM_DEVICES'),
    },
    deviceState: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('DEVICE_STATE'),
    },
  },
}
