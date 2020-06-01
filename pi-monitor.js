const Gpio = require('onoff').Gpio;

const GPIOEnabled = true

class PiMonitor {

    pubsub

    constructor(pubsub) {
        this.pubsub = pubsub
    }

    initialise() {
        console.log("Initialising IO")        
    }

    contactSensor() {
        contactSensor = new Gpio(6, 'in', 'both')
        this.contactSensor.watch((err, value) => {
            this.pubsub.publish("DOOR_STATUS", { doorStatus: "CONTACT SENSOR" })
        })
    }

}

module.exports = PiMonitor;