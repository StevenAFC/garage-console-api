const { DataSource } = require('apollo-datasource')
const si = require('systeminformation')

class PiApi extends DataSource {
  async getSystemStatus() {
    try {
      const cpuTemperature = await si.cpuTemperature()
      const currentLoad = await si.currentLoad()
      const mem = await si.mem()

      return {
        temp: cpuTemperature.main == NaN ? 0 : Math.round(cpuTemperature.main),
        totalMemory: mem.total == NaN ? 0 : mem.total,
        usedMemory: mem.used == NaN ? 0 : mem.used,
        freeMemory: mem.free == NaN ? 0 : mem.free,
        cpuLoad:
          currentLoad.currentLoad == NaN
            ? 0
            : Math.round(currentLoad.currentLoad),
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
}

module.exports = PiApi
