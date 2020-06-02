const { DataSource } = require('apollo-datasource');

class PiApi extends DataSource {

    piManager

    constructor( { piManager }) {
        super()
        this.piManager = piManager;
    }

    async openGarageDoor(pubsub) {
        return piManager.relayTrigger({ gpio: 17, duration: 2000 })
    }

    async closeGarageDoor(pubsub) {
        return piManager.relayTrigger({ gpio: 18, duration: 2000 })
    }

}

module.exports = PiApi;