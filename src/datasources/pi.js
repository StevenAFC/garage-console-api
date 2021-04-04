const { DataSource } = require('apollo-datasource')
const fs = require('fs').promises

class PiApi extends DataSource {
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
}

module.exports = PiApi
