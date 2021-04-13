const { DataSource } = require('apollo-datasource')
const si = require('systeminformation')

class PiApi extends DataSource {
  async getSystemStatus() {
    try {
      const cpuTemperature = await si.cpuTemperature()
      const currentLoad = await si.currentLoad()
      const mem = await si.mem()

      return {
        temp: Math.round(cpuTemperature.main),
        totalMemory: mem.total,
        usedMemory: mem.used,
        cpuLoad: Math.round(currentLoad.currentLoad),
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
}

module.exports = PiApi
