const { DataSource } = require('apollo-datasource')

class DeviceAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async getDevices() {
    const found = await this.store.devices.findAll({
      where: {},
      include: [
        {
          model: this.store.alerts,
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    })
    return found
  }

  async outputDevices() {
    const found = await this.store.devices.findAll({
      where: {
        alarmDevice: false,
        input: false,
      },
      order: [['name', 'DESC']],
    })
    return found
  }

  async alarmDevices() {
    const found = await this.store.devices.findAll({
      where: {
        alarmDevice: true,
        input: true,
      },
      include: [
        {
          model: this.store.alerts,
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    })
    return found
  }
}

module.exports = DeviceAPI
