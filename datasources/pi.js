const { DataSource } = require('apollo-datasource');
const Gpio = require('onoff').Gpio;

class PiApi extends DataSource {

    async openGarageDoor(pubsub) {
        pubsub.publish("SUBSCRIBE", { something: 125.4 })

        console.log("Door opening")

        if (global.doorOpening) return false

        try {
            global.doorOpening = true;
            //const openPin = new Gpio(17, 'out')
            //openPin.writeSync(1)

            setTimeout(() => {
                global.doorOpening = false;
                //openPin.writeSync(0)
                //openPin.unexport()
            }, 2000)

            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

}

module.exports = PiApi;