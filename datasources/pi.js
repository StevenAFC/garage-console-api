const { DataSource } = require('apollo-datasource');

class PiApi extends DataSource {

    constructor({ piManager, store }) {
        super()
        this.piManager = piManager;
        this.store = store;
    }

    async devicePulse(id) {
        const device = await this.store.devices.findByPk(id);
        return piManager.relayTrigger({ device: device, duration: device.duration })
    }
}

module.exports = PiApi;