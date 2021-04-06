const Service = require('./service')
const TuyAPI = require('tuyapi')

class Tuya extends Service {
  deviceType = 'TUYA'

  async initialize() {
    this.devices.forEach((device) => {
      this.connectToDevice({ device })
    })
  }

  async devicePulse({ device }) {
    const d = this.getDevice({ deviceId: device.id })

    if (d.tuyaHook.isConnected()) {
      d.tuyaHook.set({ set: !d.state })
      return true
    } else {
      console.log(d.name + ': Not currently connected to the Tuya device')
      this.connectToDevice({ device: d })
      return false
    }
  }

  connectToDevice({ device }) {
    try {
      device.tuyaHook.find().then(() => device.tuyaHook.connect())

      device.tuyaHook.on('connected', () => {
        console.log('Connected to device!')
      })

      device.tuyaHook.on('disconnected', () => {
        this.connectToDevice({ device })
      })

      device.tuyaHook.on('data', (data) => {
        try {
          this.updateState({ state: data.dps['1'], device })
          console.log('Data from device:', data)
        } catch (e) {
          console.log(data)
          console.log(e)
        }
      })
    } catch (e) {
      console.log('Unable to connect to device')
      console.log(e)
    }
  }

  async addDevice({ device }) {
    const tuyaHook = new TuyAPI({
      id: device.tuyaId,
      key: device.tuyaKey,
    })

    this.devices.push({ ...device.dataValues, tuyaHook, state: null })
  }

  async getStates() {}

  async getState({ device }) {}
}

module.exports = Tuya
