const { DataSource } = require('apollo-datasource');
const Gpio = require('onoff').Gpio;

class PiApi extends DataSource {

    openGarageDoor() {
        try {
            setTimeout(() => {
                console.log("Opening garage door")
                const openPin = new Gpio(17, 'out')
                openPin.writeSync(1)
                openPin.unexport()
            }, 5000)
        } 
        catch (e) 
        {
            console.log(e)
            return false;
        }

        return true;
    }

}

module.exports = PiApi;