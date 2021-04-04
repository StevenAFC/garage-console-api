const Gpio = require('onoff').Gpio

class PiManager {
  constructor({ pubsub, store }) {
    this.pubsub = pubsub
    this.store = store
    this.devices = []
  }

  initializeDevice({ device }) {
    let alreadyInitiated = false
    this.devices.forEach((d) => {
      if (d.id === device.id) alreadyInitiated = true
    })

    if (alreadyInitiated) return

    let pin = null
    if (Gpio.accessible) {
      pin = new Gpio(device.gpio, device.input ? 'in' : 'out', 'falling', {
        debounceTimeout: device.debounce,
        activeLow: device.inverted,
      })
    }

    this.devices.push({
      id: device.id,
      gpio: device.gpio,
      pin: pin,
      state: false,
      timeout: null,
    })
  }

  getDevice({ device }) {
    return this.devices.find((d) => d.id === device.id)
  }

  getDevices() {
    return this.devices
  }

  async watchInputDevice({ device, cb }) {
    try {
      if (Gpio.accessible) {
        this.initializeDevice({ device })
        this.getDevice({ device }).pin.watch(() => {
          cb()
        })

        this.consoleLog({
          device,
          message: 'has been initialised',
          colour: 32,
        })
      } else {
        this.consoleLog({
          device,
          message: 'cannot be initialised as the GPIO is inaccessible',
          colour: 32,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  setState({ device, state }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.state = state
      return d
    })
  }

  setTimeout({ device, timeout }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.timeout = timeout
      return d
    })
  }

  async toggle({ device }) {
    try {
      // this.initializeDevice({ device })
      const state = !this.getDevice({ device }).state
      this.write({ device, state })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  write({ device, state }) {
    try {
      this.initializeDevice({ device })
      if (Gpio.accessible) {
        this.getDevice({ device }).pin.writeSync(state ? 1 : 0)
        this.setState({ device, state })
        this.pubsub.publish('DEVICE_STATE', {
          deviceState: this.getDevice({ device }),
        })
        this.consoleLog({
          device,
          message: 'has been set to: ' + state,
          colour: 32,
        })
      } else {
        this.consoleLog({
          device,
          message:
            'pin cannot be set to ' + state + ' as the GPIO is inaccessible',
          colour: 31,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  async relayLatch({ device, state }) {
    this.write({ device, state })
  }

  async relayTrigger({ device, duration }) {
    try {
      const isActive = this.getDevice({ device })
        ? this.getDevice({ device }).state
        : false

      if (isActive) {
        clearTimeout(this.getDevice({ device }).timeout)
        this.write({ device, state: 0 })
        return true
      }

      this.write({ device, state: 1 })

      this.setTimeout({
        device,
        timeout: setTimeout(() => {
          this.write({ device, state: 0 })
        }, duration),
      })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  // prettier-ignore
  consoleLog({ device, message, colour }) {
    device
      ? console.log(
        '\u001b[' +
            colour +
            'm' +
            'Device: ' +
            device.name +
            ' (' +
            device.gpio +
            ') ' +
            message +
            '\u001b[0m'
      )
      : console.log('\u001b[' + colour + 'm' + message + '\u001b[0m')
  }
}

module.exports = PiManager
