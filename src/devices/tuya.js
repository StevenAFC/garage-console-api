const Service = require('./service')
const TuyAPI = require('tuyapi')

class Tuya extends Service {
  deviceType = 'TUYA'

  async initialize() {
    this.devices.forEach((device) => {
      try {
        this.connectToDevice({ device })
      } catch (e) {
        console.log('Error initializing Tuya device: ' + device.name)
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
        console.log(d.name + ': Not currently connected to the Tuya device')
        this.connectToDevice({ device: d })
        return false
      }
    } catch (e) {
      console.log('Unable to connect to Tuya device')
    }
  }

  reconnectToDevice({ device }) {
    console.log('Reconnecting to ' + device.name + ' in 5 seconds')
    setTimeout(() => this.connectToDevice({ device }), 5000)
  }

  connectToDevice({ device }) {
    try {
      device.tuyaHook.find().then(() => device.tuyaHook.connect())

      device.tuyaHook.on('connected', () => {
        console.log('Connected to ' + device.name)
      })

      device.tuyaHook.on('disconnected', () => {
        console.log('Disconnected from ' + device.name)
        //this.reconnectToDevice({ device })
      })

      device.tuyaHook.on('error', (error) => {
        //console.log('Error on device: ' + device.name + ' - ' + error.message)
        device.tuyaHook.disconnect()
      })

      device.tuyaHook.on('data', (data) => {
        try {
          this.updateState({ state: data.dps['1'], device })
          console.log('Data from Tuya device:', data)
        } catch (e) {
          console.log(data)
        }
      })
    } catch (e) {
      console.log('Unable to connect to Tuya device')
    }
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
