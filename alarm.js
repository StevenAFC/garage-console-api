class Alarm {

    status = "DISARMED"

    constructor({pubsub, store, piManager}) {
        this.pubsub = pubsub
        this.store = store
        this.piManager = piManager
    }

    async initialise() {
        console.log("Initialising alarm IO")
        this.setAlarmState("DISARMED")
        const inputDevices = await this.store.devices.findAll({
            where: {
                input: 1,
                alarmDevice: 1
            }
        })

        inputDevices.map((device) => {
            this.piManager.watchInputDevice(device, () => this.alert(device.id))
        }) 
    }

    async alert (deviceId) {

        if (this.status === "DISARMED") {
            console.log('\u001b[' + 34 + 'm' + "Device ID " + deviceId + " has been triggered however the alarm is not armed" + '\u001b[0m')
            return true
        }

        console.log('\u001b[' + 32 + 'm' + "Device ID " + deviceId + " has been triggered" + '\u001b[0m')

        this.store.alerts.create({
            deviceId: deviceId
        })

        await this.store.devices.update({ alarmTriggered: true }, { where: { id: deviceId } })

        this.refreshDevices()

        this.triggerAlarm(1)

        console.log('\u001b[' + 32 + 'm' + "SIREN SIREN SIREN" + '\u001b[0m')

        return true
    }

    async triggerAlarm(triggered) {
        const outputDevices = await this.store.devices.findAll({
            where: {
                input: 0,
                alarmDevice: 1
            }
        })

        outputDevices && outputDevices.map((device) => {
            this.piManager.relayTrigger({ gpio: device.gpio, duration: 500 })
        }) 
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
        return this.status
    }

    alarmState(state) {
        this.status = state

        console.log('\u001b[' + 32 + 'm' + "Alarm State has been changed to " + state + '\u001b[0m')

        this.pubsub.publish("ALARM_STATUS", {
            alarmStatus: this.status
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
                this.refreshDevices()
                this.triggerAlarm(0)
                break;
            default:
                return false
        }

        return true
    }

}

module.exports = Alarm;