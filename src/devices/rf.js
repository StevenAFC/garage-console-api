const Service = require('./service')
const { PythonShell } = require('python-shell')

class Pi extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'RF'

    this.pythonScript = `
    import time
    import sys
    import RPi.GPIO as GPIO
    
    code = sys.argv[1:][1]
    short_delay = 0.00020
    extended_delay = 0.0096
    
    NUM_ATTEMPTS = 10
    TRANSMIT_PIN = int(sys.argv[1:][0])
    
    def transmit_code(code):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(TRANSMIT_PIN, GPIO.OUT)
        for t in range(NUM_ATTEMPTS):
            for i in code:
                if i == '1':
                    GPIO.output(TRANSMIT_PIN, 1)
                    time.sleep(short_delay)
                    GPIO.output(TRANSMIT_PIN, 0)
                elif i == '0':
                    GPIO.output(TRANSMIT_PIN, 1)
                    GPIO.output(TRANSMIT_PIN, 0)
                    time.sleep(short_delay)
                else:
                    continue
            GPIO.output(TRANSMIT_PIN, 0)
            time.sleep(extended_delay)
        GPIO.cleanup()
    
    
    transmit_code(code)
      
      `
  }

  async addDevice({ device }) {
    const state = false

    this.devices.push({ ...device.dataValues, state })
  }

  async devicePulse({ device }) {
    PythonShell.runString(
      this.pythonScript,
      { args: [device.dataValues.gpio, device.dataValues.signal] },
      (err) => {
        if (err) console.log(err)
      }
    )

    return true
  }
}

module.exports = Pi
