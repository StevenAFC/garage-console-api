const { DataSource } = require('apollo-datasource');

class DeviceAPI extends DataSource {
    constructor({ store }) {
        super();
        this.store = store;
    }

    initialize(config) {
        this.context = config.context;
    }

    async getDevices() {
        const found = await this.store.devices.findAll();
        return found;
    }

    async getAlarmDevices() {
        const found = await this.store.devices.findAll({ 
            where: {
                alarmDevice: true
            },
            include: [{
                model: this.store.alerts 
            }]
        });
        return found;
    }
}

module.exports = DeviceAPI;