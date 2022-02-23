module.exports = {
  Query: {
    atmosphere: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.atmosphereAPI.getAtmosphere()
    },
    alerts: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.alertAPI.getAlerts()
    },
    devices: async (_, args, { req, dataSources, deviceManager }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      let results = await dataSources.deviceAPI.getDevices()

      results = results.map((d) => {
        return {
          ...d.dataValues,
          state: deviceManager.getDeviceState({ id: d.id }),
        }
      })

      if (args.input !== undefined) {
        results = results.filter((r) => r.input === args.input)
      }

      if (args.alarmDevice !== undefined) {
        results = results.filter((r) => r.alarmDevice === args.alarmDevice)
      }

      return results
    },
    alarmStatus: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.alarmAPI.getAlarmState()
    },
    piStatus: async (_, __, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.piAPI.getSystemStatus()
    },
    deviceState: async (_, args, { req, dataSources, deviceManager }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await deviceManager.getDeviceState(args)
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
    subscribe: async (_, args, { req, dataSources }) => {
      if (!dataSources.userAPI.authenticate(req.headers.token)) return null
      return await dataSources.subscriptionAPI.subscribe(args)
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
      resolve: (payload) => {
        return payload
      },
    },
  },
}
