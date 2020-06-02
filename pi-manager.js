const Gpio = require('onoff').Gpio;

class PiManager {

    jobs = {}

    constructor({pubsub, store, alarm}) {
        this.pubsub = pubsub
        this.store = store
        this.alarm = alarm
    }

    async initialise() {
        console.log("Initialising IO")
        const inputDevices = await this.store.devices.findAll({
            where: {
                input: 1
            }
        })

        inputDevices.map((device) => {
            this.initialiseInputDevice(device)
        }) 
    }

    initialiseInputDevice(device) {
        try {

            if (Gpio.accessible) {
                const inputDevice = new Gpio(device.gpio, 'in', 'falling', { debounceTimeout: device.debounce, activeLow: device.inverted })
                inputDevice.watch((err, value) => {
                    this.alarm.alert({ deviceId: device.id })
                })
                console.log('\u001b[' + 32 + 'm' + "GPIO " + device.gpio + " has been initialised" + '\u001b[0m')
            } else {
                console.log('\u001b[' + 31 + 'm' + "GPIO " + device.gpio + " pin cannot be initialised as the GPIO is inaccessible" + '\u001b[0m')
            }

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
                console.log('\u001b[' + 31 + 'm' + "GPIO " + gpio + " pin cannot be set to high as the GPIO is inaccessible" + '\u001b[0m')
            }
            
            setTimeout(() => {
                if (Gpio.accessible) {
                    const openPin = new Gpio(gpio, 'out')
                    openPin.writeSync(0)
                    openPin.unexport()
                    console.log('\u001b[' + 32 + 'm' + "GPIO " + gpio + " pin been set to low" + '\u001b[0m')
                } else {
                    console.log('\u001b[' + 31 + 'm' + "GPIO " + gpio + " pin cannot be set to low as the GPIO is inaccessible" + '\u001b[0m')
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