const { DataSource } = require('apollo-datasource');

class AlertAPI extends DataSource {
    constructor({ store }) {
        super();
        this.store = store;
    }

    initialize(config) {
        this.context = config.context;
    }

    async getAlerts() {
        const found = await this.store.alerts.findAll({
            include: [{
                model: this.store.devices 
            }]
        });
        console.log(found)
        return found;
    }
}

module.exports = AlertAPI;