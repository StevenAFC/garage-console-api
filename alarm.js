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
            this.piManager.watchInputDevice({ device, cb: () => this.alert(device) })
        }) 
    }

    async alert (device) {

        if (this.status === "DISARMED") {
            console.log('\u001b[' + 34 + 'm' + "Device " + device.name + " (" + device.gpio + ") has been triggered however the alarm is not armed" + '\u001b[0m')
            return true
        }

        console.log('\u001b[' + 32 + 'm' + "Device " + device.name + " (" + device.gpio + ") has been triggered" + '\u001b[0m')

        this.store.alerts.create({
            deviceId: device.id
        })

        await this.store.devices.update({ alarmTriggered: true }, { where: { id: device.id } })

        this.refreshDevices()

        this.triggerAlarm(1)

        return true
    }

    async triggerAlarm(triggered) {

        console.log('\u001b[' + 32 + 'm' + "Alarm triggered! State: " +  triggered + '\u001b[0m')

        const outputDevices = await this.store.devices.findAll({
            where: {
                input: 0,
                alarmDevice: 1
            }
        })

        outputDevices && outputDevices.map((device) => {
            console.log('\u001b[' + 32 + 'm' + "Alarm Output Device " +  device.name + " (" + device.gpio + ")" + '\u001b[0m')
            this.piManager.relayLatch({ device: device, state: triggered })
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
                this.triggerAlarm(1)
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