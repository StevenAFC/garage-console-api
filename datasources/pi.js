const { DataSource } = require('apollo-datasource')

class PiApi extends DataSource {
  constructor({ piManager, store }) {
    super()
    this.piManager = piManager
    this.store = store
  }

  async devicePulse(id) {
    const device = await this.store.devices.findByPk(id)

    // if device duration is null we are assuming that the device is a toggle
    if (device.duration === null) {
      return this.piManager.toggle({ device })
    } else {
      return this.piManager.relayTrigger({
        device: device,
        duration: device.duration,
      })
    }
  }
}

module.exports = PiApi
