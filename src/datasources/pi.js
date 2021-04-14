const { DataSource } = require('apollo-datasource')
const si = require('systeminformation')

class PiApi extends DataSource {
  async getSystemStatus() {
    try {
      const cpuTemperature = await si.cpuTemperature()
      const currentLoad = await si.currentLoad()
      const mem = await si.mem()

      return {
        temp: isNaN(cpuTemperature.main) ? 0 : Math.round(cpuTemperature.main),
        totalMemory: isNaN(mem.total) ? 0 : mem.total,
        usedMemory: isNaN(mem.used) ? 0 : mem.used,
        freeMemory: isNaN(mem.free) ? 0 : mem.free,
        cpuLoad: isNaN(currentLoad.currentLoad)
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
