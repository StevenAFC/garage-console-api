class Alarm {

    pubsub
    store

    constructor({pubsub, store}) {
        this.pubsub = pubsub
        this.store = store
    }

    async alert ({ deviceId }) {
        console.log(deviceId)

        this.store.alerts.create({
            deviceId: deviceId
        })

        await this.store.devices.update({ alarmTriggered: true }, { where: { id: deviceId } })

        this.refreshDevices();

        return true
    }

    async refreshDevices() {
        const devices = await this.store.devices.findAll({ 
            where: {
                alarmDevice: true
            },
            include: [{
                model: this.store.alerts,
                limit: 3, 
                order: [["createdAt", "DESC"]]
            }]
        });

        this.pubsub.publish("ALARM_DEVICES", {
            alarmDevices: devices
        })
    }

    async setAlarmState(state) {
        switch(state) {
            case "DEACTIVATE":
                await this.store.devices.update({ alarmTriggered: false }, { where: { alarmTriggered: true } })
                this.refreshDevices();
                break;
            case "DISARM":
                break;
            case "ARM":
                break;
            default:
                return false
        }

        return true
    }

}

module.exports = Alarm;