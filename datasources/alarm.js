const { DataSource } = require('apollo-datasource');

class AlarmAPI extends DataSource {
    constructor({ store, alarm }) {
        super()
        this.store = store
        this.alarm = alarm
    }

    initialize(config) {
        this.context = config.context;
    }

    async setAlarmState(state) {
        this.alarm.setAlarmState(state)
    }
}

module.exports = AlarmAPI;