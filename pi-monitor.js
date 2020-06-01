const Gpio = require('onoff').Gpio;

class PiMonitor {

    pubsub
    store
    alarm

    constructor({pubsub, store, alarm}) {
        this.pubsub = pubsub
        this.store = store
        this.alarm = alarm
    }

    initialise() {
        console.log("Initialising IO")   
        this.contactSensor()     
    }

    contactSensor() {
        try {
            const contactSensorIO = new Gpio(6, 'in', 'falling', { debounceTimeout: 25, activeLow: true })
            contactSensorIO.watch((err, value) => {
                this.alarm.alert({ sensorName: "REAR_DOOR_CONTACT_SENSOR" })
            })
        } catch (e) {
            console.log(e);
        }
    }

}

module.exports = PiMonitor;