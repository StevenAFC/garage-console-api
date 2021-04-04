const Service = require('./service')
const TuyAPI = require('tuyapi')

class Tuya extends Service {
  deviceType = 'TUYA'

  async initialize() {
    this.devices.forEach((device) => {
      device.tuyaHook.find().then(() => device.tuyaHook.connect())

      device.tuyaHook.on('connected', () => {
        console.log('Connected to device!')
      })

      device.tuyaHook.on('disconnected', () => {
        console.log('Disconnected from device.')
      })

      device.tuyaHook.on('data', (data) => {
        this.updateState({ state: data.dps['1'], device })
        console.log('Data from device:', data)
      })
    })
  }

  async devicePulse({ device }) {
    this.devices.map((d) => {
      if (d.id === device.id) {
        console.log(d.state)
        d.tuyaHook.set({ set: !d.state })
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

  async getStates() {}

  async getState({ device }) {}
}

module.exports = Tuya
