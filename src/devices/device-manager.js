const Tuya = require('./tuya')
const Pi = require('./pi')
const Rf = require('./rf')
const Mqtt = require('./mqtt')

class DeviceManager {
  constructor({ pubsub, store, mqtt }) {
    this.store = store

    this.pubsub = pubsub

    this.tuya = new Tuya({ pubsub, mqtt })
    this.pi = new Pi({ pubsub, mqtt })
    this.rf = new Rf({ pubsub, mqtt })
    this.mqtt = new Mqtt({ pubsub, mqtt })

    this.services = [this.tuya, this.pi, this.rf, this.mqtt]

    this.initialize()
  }

  async initialize() {
    const devices = await this.store.devices.findAll()

    devices.forEach((device) => {
      switch (device.deviceType) {
        case 'RASPBERRY_PI':
          this.pi.addDevice({ device })
          break
        case 'TUYA':
          this.tuya.addDevice({ device })
          break
        case 'RF':
          this.rf.addDevice({ device })
          break
        case 'MQTT':
          this.mqtt.addDevice({ device })
          break
      }
    })

    this.services.forEach((service) => {
      service.initialize()
    })
  }

  getDevice({ id }) {
    const devices = []

    this.services.forEach((service) => {
      devices.push(...service.getDevices())
    })

    return devices.find((d) => d.id === parseInt(id))
  }

  getDevices() {
    const devices = []

    this.services.forEach((service) => {
      devices.push(...service.getDevices())
    })

    return devices
  }

  getDeviceStates() {
    const devices = this.getDevices()

    return devices.map((d) => {
      return {
        device: d,
        state: { id: d.id, state: d.state },
      }
    })
  }

  getDeviceState({ id }) {
    const device = this.getDevice({ id })
    return device.state
  }

  devicePulse({ id }) {
    const device = this.getDevice({ id })

    switch (device.deviceType) {
      case 'RASPBERRY_PI':
        return this.pi.devicePulse({ device })
      case 'TUYA':
        return this.tuya.devicePulse({ device })
      case 'RF':
        return this.rf.devicePulse({ device })
    }
  }

  setState({ device, state }) {
    const d = this.getDevice({ id: device.id })

    switch (d.deviceType) {
      case 'RASPBERRY_PI':
        return this.pi.setState({ device, state })
      case 'TUYA':
        return this.tuya.setState({ device, state })
    }
  }
}

module.exports = DeviceManager
