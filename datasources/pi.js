const { DataSource } = require('apollo-datasource');
const Gpio = require('onoff').Gpio;

class PiApi extends DataSource {

    async openGarageDoor(pubsub) {
        if (global.doorOpening) return false

        try {
            pubsub.publish("DOOR_STATUS", { doorStatus: "OPENING" })
            global.doorOpening = true;
            const openPin = new Gpio(17, 'out')
            openPin.writeSync(1)

            setTimeout(() => {
                global.doorOpening = false;
                openPin.writeSync(0)
                openPin.unexport()
                pubsub.publish("DOOR_STATUS", { doorStatus: "OPEN" })
            }, 2000)

            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async closeGarageDoor(pubsub) {
        if (global.doorOpening) return false

        try {
            pubsub.publish("DOOR_STATUS", { doorStatus: "CLOSING" })
            global.doorOpening = true;
            const openPin = new Gpio(18, 'out')
            openPin.writeSync(1)

            setTimeout(() => {
                global.doorOpening = false;
                openPin.writeSync(0)
                openPin.unexport()
                pubsub.publish("DOOR_STATUS", { doorStatus: "CLOSED" })
            }, 2000)

            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

}

module.exports = PiApi;