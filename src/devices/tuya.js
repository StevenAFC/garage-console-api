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
          `Tuya: Error initializing Tuya  ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}: ${e.message}`
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
        this.connectToDevice({ device: d })
        return false
      }
    } catch (e) {
      console.log(
        `Tuya: Unable to connect to ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}: ${e.message}`
      )
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
      console.log(
        `Tuya: Connected to ${device.name} (id:${device.tuyaId} key:${device.tuyaKey})`
      )
    })

    device.tuyaHook.on('disconnected', () => {
      console.log(
        `Tuya: Disconnected from ${device.name} (id:${device.tuyaId} key:${device.tuyaKey})`
      )
      // this.reconnectToDevice({ device })
      this.updateState({ state: null, device })
    })

    device.tuyaHook.on('error', (e) => {
      console.log(
        `Tuya: Error on device: ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}): ${e.message}`
      )
      device.tuyaHook.disconnect()
      this.updateState({ state: null, device })
    })

    device.tuyaHook.on('data', (data) => {
      try {
        this.updateState({ state: data.dps['1'], device })
      } catch (e) {
        console.log(
          `Tuya: Error receiving data ${device.name} (id:${device.tuyaId} key:${device.tuyaKey}): ${e.message}`
        )
      }
    })
  }

  async addDevice({ device }) {
    const config = JSON.parse(device.config)

    const tuyaHook = new TuyAPI({
      id: config.tuyaId,
      key: config.tuyaKey,
    })

    this.devices.push({ ...device.dataValues, tuyaHook, state: null })
  }
}

module.exports = Tuya
