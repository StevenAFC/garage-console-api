const { DataSource } = require('apollo-datasource')
const fs = require('fs').promises

class PiApi extends DataSource {
  constructor({ piManager, tuyaManager, store }) {
    super()
    this.piManager = piManager
    this.tuyaManager = tuyaManager
    this.store = store
  }

  async readTemperature() {
    var output

    try {
      output = await fs.readFile(
        '/sys/class/thermal/thermal_zone0/temp',
        'utf8'
      )
    } catch (e) {
      // console.log(e)
      return 0
    }

    return Math.round((output / 1000) * 10) / 10
  }

  async getSystemStatus() {
    return {
      temp: this.readTemperature(),
    }
  }

  async getDeviceStates() {
    const deviceStates = this.piManager.getDevices()
    const devices = await this.store.devices.findAll()

    return devices.map((d) => {
      const state = deviceStates.find((s) => s.id === d.id)

      return {
        device: d.dataValues,
        state: state || { id: d.id, state: false },
      }
    })
  }

  async devicePulse(id) {
    const device = await this.store.devices.findByPk(id)

    if (device.deviceType == 'RASPBERRY_PI') {
      // if device duration is null we are assuming that the device is a toggle
      if (device.duration === null) {
        return await this.piManager.toggle({ device })
      } else {
        return await this.piManager.relayTrigger({
          device: device,
          duration: device.duration,
        })
      }
    } else if (device.deviceType == 'TUYA') {
      return await this.tuyaManager.toggle({ device })
    }
  }
}

module.exports = PiApi
