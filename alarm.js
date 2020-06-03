class Alarm {

    pubsub
    store
    status = "DISARMED"

    constructor({pubsub, store}) {
        this.pubsub = pubsub
        this.store = store
    }

    async alert ({ deviceId }) {

        if (this.status === "DISARMED") {
            console.log('\u001b[' + 34 + 'm' + "Device ID " + state + "has been triggered however the alarm is not armed" + '\u001b[0m')
            return true
        }

        console.log('\u001b[' + 32 + 'm' + "Device ID " + state + "has been triggered" + '\u001b[0m')

        this.store.alerts.create({
            deviceId: deviceId
        })

        await this.store.devices.update({ alarmTriggered: true }, { where: { id: deviceId } })

        this.refreshDevices();

        console.log('\u001b[' + 32 + 'm' + "SIREN SIREN SIREN" + '\u001b[0m')

        return true
    }

    async refreshDevices() {
        const devices = await this.store.devices.findAll({ 
            where: {
                alarmDevice: true
            },
            include: [{
                model: this.store.alerts,
                limit: 1, 
                order: [["createdAt", "DESC"]]
            }]
        });

        this.pubsub.publish("ALARM_DEVICES", {
            alarmDevices: devices
        })
    }

    getAlarmState() {
        return this.state
    }

    alarmState(state) {
        this.state = state

        console.log('\u001b[' + 32 + 'm' + "Alarm State has been changed to " + state + '\u001b[0m')

        this.pubsub.publish("ALARM_STATUS", {
            alarmStatus: this.state
        })
    }

    async setAlarmState(state) {
        switch(state) {
            case "DISARM":
                await this.store.devices.update({ alarmTriggered: false }, { where: { alarmTriggered: true } })
                this.refreshDevices()
                this.alarmState("DISARMED")
                console.log('\u001b[' + 32 + 'm' + "Siren silenced" + '\u001b[0m')
                break;
            case "ARM":
                this.alarmState("ARMED")
                break;
            default:
                return false
        }

        return true
    }

}

module.exports = Alarm;