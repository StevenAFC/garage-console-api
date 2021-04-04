const Tuya = require('./tuya')
const Pi = require('./pi')

class DeviceManager {
  constructor({ pubsub, store }) {
    this.store = store

    this.tuya = new Tuya({ pubsub })
    this.pi = new Pi({ pubsub })

    this.services = [this.tuya, this.pi]

    this.initialize()
  }

  async initialize() {
    const devices = await this.store.devices.findAll()

    devices.map((device) => {
      switch (device.deviceType) {
        case 'RASPBERRY_PI':
          this.pi.addDevice({ device })
          break
        case 'TUYA':
          this.tuya.addDevice({ device })
          break
      }
    })

    this.services.map((service) => {
      service.initialize()
    })
  }

  getDevices() {
    let devices = []

    this.services.map((service) => {
      devices.push(...service.getDevices())
    })

    return devices
  }

  async getDeviceStates() {
    const devices = this.getDevices()

    return devices.map((d) => {
      return {
        device: d,
        state: { id: d.id, state: d.state },
      }
    })
  }

  async devicePulse(id) {
    const device = await this.store.devices.findByPk(id)

    switch (device.deviceType) {
      case 'RASPBERRY_PI':
        return this.pi.devicePulse({ device })
      case 'TUYA':
        return this.tuya.devicePulse({ device })
    }
  }

  async setState({ device, state }) {
    const d = await this.store.devices.findByPk(device.id)

    switch (d.deviceType) {
      case 'RASPBERRY_PI':
        return this.pi.setState({ device, state })
      case 'TUYA':
        return this.tuya.setState({ device, state })
    }
  }

  async watchInputDevice({ device, cb }) {
    const d = await this.store.devices.findByPk(device.id)

    switch (d.deviceType) {
      case 'RASPBERRY_PI':
        return this.pi.watchInputDevice({ device: d, cb })
      case 'TUYA':
        return this.tuya.watchInputDevice({ device: d, cb })
    }
  }
}

module.exports = DeviceManager
