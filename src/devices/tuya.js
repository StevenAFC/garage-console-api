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
        this.updateState({ data })
        console.log('Data from device:', data)
      })
    })
  }

  async updateState({ data }) {
    this.devices = this.devices.map((d) => {
      if (d.tuyaId === data.devId) d.state = data.dps['1']
    })

    console.log('Devices:')
    console.log(this.devices)

    /*const device = this.devices.map((d) => {
      if (d.tuyaId === data.devId) return d
    })

    console.log(device)*/

    /*this.pubsub.publish('DEVICE_STATE', {
      deviceState: this.device.find((d) => d.tuyaId == data.devId),
    })*/
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
