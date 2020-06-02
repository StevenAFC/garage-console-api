const Gpio = require('onoff').Gpio;

class PiManager {

    pubsub
    store
    alarm

    jobs = {}

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

    relayTrigger({ gpio, duration }) {

        try {
            if (!this.jobs[gpio]) { this.jobs[gpio] = 1 } else { return false }
            
            if (Gpio.accessible) {
                const openPin = new Gpio(gpio, 'out')
                openPin.writeSync(1)
                console.log('\u001b[' + 32 + 'm' + "GPIO " + gpio + " has been set to high" + '\u001b[0m')
            } else {
                console.log('\u001b[' + 31 + 'm' + "GPIO " + gpio + " pin cannot be set to high as it is inaccessible" + '\u001b[0m')
            }
            
            setTimeout(() => {
                if (Gpio.accessible) {
                    openPin.writeSync(0)
                    openPin.unexport()
                    console.log('\u001b[' + 32 + 'm' + "GPIO " + gpio + " pin been set to low" + '\u001b[0m')
                } else {
                    console.log('\u001b[' + 31 + 'm' + "GPIO " + gpio + " pin cannot be set to low as it is inaccessible" + '\u001b[0m')
                }

                this.jobs[gpio] = 0
                
            }, duration)

            return true
            
        } catch (e) {
            console.log(e)
            return false
        }

    }

}

module.exports = PiManager;