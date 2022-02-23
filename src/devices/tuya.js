const Service = require('./service')
const TuyAPI = require('tuyapi')

class Tuya extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'TUYA'
  }

  async initialize() {
    this.devices.forEach((device) => {
      try {
        this.connectToDevice({ device })
      } catch (e) {
        console.log(
          `Tuya: Error initializing Tuya ${device.name}: ${e.message}`
        )
      }
    })
  }

  async devicePulse({ device }) {
    const d = this.getDevice({ deviceId: device.id })

    try {
      if (d.tuyaHook.isConnected()) {
        d.tuyaHook.set({ set: !d.state })
        return true
      } else {
        // console.log(d.name + ': Not currently connected to the Tuya device')
        this.connectToDevice({ device: d })
        return false
      }
    } catch (e) {
      console.log(`Tuya: Unable to connect to Tuya device: ${e.message}`)
    }
  }

  reconnectToDevice({ device }) {
    console.log(
      `Tuya: Reconnecting to ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}) in 5 seconds`
    )
    setTimeout(() => this.connectToDevice({ device }), 5000)
  }

  connectToDevice({ device }) {
    device.tuyaHook
      .find()
      .then(() => device.tuyaHook.connect())
      .catch((e) => {
        console.log(
          `Tuya: Error connecting to ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}): ${e.message}`
        )
      })

    device.tuyaHook.on('connected', () => {
      console.log('Connected to ' + device.name)
    })

    device.tuyaHook.on('disconnected', () => {
      // console.log('Disconnected from ' + device.name)
      // this.reconnectToDevice({ device })
      this.updateState({ state: null, device })
    })

    device.tuyaHook.on('error', (error) => {
      console.log(`Tuya: Error on device: ${device.name} - ${error.message}`)
      device.tuyaHook.disconnect()
      this.updateState({ state: null, device })
    })

    device.tuyaHook.on('data', (data) => {
      try {
        this.updateState({ state: data.dps['1'], device })
      } catch (e) {
        console.log(`Tuya: Error receiving data - ${e.message}`)
      }
    })
  }

  async addDevice({ device }) {
    const tuyaHook = new TuyAPI({
      id: device.tuyaId,
      key: device.tuyaKey,
    })

    this.devices.push({ ...device.dataValues, tuyaHook, state: null })
  }
}

module.exports = Tuya
