const Tuya = require('./tuya')
const Pi = require('./pi')
const Rf = require('./rf')
const RfReceive = require('./rf-receive')
const Mqtt = require('./mqtt')

class DeviceManager {
  constructor({ pubsub, store, mqtt }) {
    this.store = store

    this.pubsub = pubsub

    this.tuya = new Tuya({ pubsub, mqtt })
    this.pi = new Pi({ pubsub, mqtt })
    this.rf = new Rf({ pubsub, mqtt })
    this.rfReceive = new RfReceive({ pubsub, mqtt })
    this.mqtt = new Mqtt({ pubsub, mqtt })

    this.services = [this.tuya, this.pi, this.rf, this.rfReceive, this.mqtt]

    this.initialize()

    this.pubsub.subscribe('RF_SIGNAL_RECEIVED', ({ rfSignalReceived }) => {
      const { code } = rfSignalReceived

      const rfReceiveDevice = this.rfReceive.device
      let expectedCode = null
      try {
        expectedCode = rfReceiveDevice?.config
          ? JSON.parse(rfReceiveDevice.config).receiveCode
          : null
      } catch { /* invalid config */ }

      if (!expectedCode) {
        console.log(`RF code received (not yet configured): ${code}`)
        return
      }

      if (code !== expectedCode) {
        console.log(`RF code received (no match): ${code}`)
        return
      }

      const sensor = this.getDevices().find((d) => d.name === 'Garage Door Sensor')
      const isClosed = sensor ? sensor.state === 1 : true
      const targetName = isClosed ? 'Open Garage Door' : 'Close Garage Door'
      const targetDevice = this.getDevices().find((d) => d.name === targetName)

      if (targetDevice) {
        console.log(`RF code matched — triggering: ${targetName}`)
        this.pi.devicePulse({ device: targetDevice })
      }
    })
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
        case 'RF_RECEIVE':
          this.rfReceive.initialize({ device })
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
        this.rfReceive.pause()
        return this.rf.devicePulse({ device }).finally(() => this.rfReceive.resume())
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
