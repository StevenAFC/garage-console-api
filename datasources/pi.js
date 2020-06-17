const { DataSource } = require('apollo-datasource')
const { spawnSync } = require('child_process')

class PiApi extends DataSource {
  constructor({ piManager, store }) {
    super()
    this.piManager = piManager
    this.store = store
  }

  readTemperature() {
    var regex = /temp=([^'C]+)/
    var cmd = spawnSync('/opt/vc/bin/vcgencmd', ['measure_temp'])

    return cmd.stdout ? regex.exec(cmd.stdout.toString('utf8'))[1] : null
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

    // if device duration is null we are assuming that the device is a toggle
    if (device.duration === null) {
      return await this.piManager.toggle({ device })
    } else {
      return await this.piManager.relayTrigger({
        device: device,
        duration: device.duration,
      })
    }
  }
}

module.exports = PiApi
