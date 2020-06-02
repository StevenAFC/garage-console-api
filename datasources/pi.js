const { DataSource } = require('apollo-datasource');

class PiApi extends DataSource {

    constructor({ piManager, store }) {
        super()
        this.piManager = piManager;
        this.store = store;
    }

    async devicePulse(id) {
        let device = await this.store.devices.findByPk(id);
        return piManager.relayTrigger({ gpio: device.gpio, duration: device.duration })
    }

    async deviceSwitch(id) {
        let device = await this.store.devices.findByPk(id);
        return piManager.relayTrigger({ gpio: device.gpio })
    }

}

module.exports = PiApi;