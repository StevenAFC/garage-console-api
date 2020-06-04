const { DataSource } = require('apollo-datasource')

class AlarmAPI extends DataSource {
  constructor({ store, alarm }) {
    super()
    this.store = store
    this.alarm = alarm
  }

  initialize(config) {
    this.context = config.context
  }

  async setAlarmState(state) {
    this.alarm.setAlarmState(state)
  }

  async getAlarmState() {
    return this.alarm.getAlarmState()
  }
}

module.exports = AlarmAPI
