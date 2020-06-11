const Gpio = require('onoff').Gpio

class PiManager {
  constructor({ pubsub, store }) {
    this.pubsub = pubsub
    this.store = store
    this.jobs = {}
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
      active: false,
    })
  }

  getDevice({ device }) {
    return this.devices.find((d) => d.id === device.id)
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

  setActive({ device, state }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.active = state
      return d
    })
  }

  async toggle({ device }) {
    this.initializeDevice({ device })
    const state = !this.getDevice({ device }).active
    this.write({ device, state })
    return { state, duration: null }
  }

  write({ device, state }) {
    try {
      this.initializeDevice({ device })
      if (Gpio.accessible) {
        this.getDevice({ device }).pin.writeSync(state ? 1 : 0)
        this.setActive({ device, state })
        this.consoleLog({
          device,
          message: 'has been set to: ' + state,
          colour: 32,
        })
      } else {
        this.consoleLog({
          device,
          message: 'pin cannot be set to high as the GPIO is inaccessible',
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
    if (!this.jobs[device.gpio]) {
      this.jobs[device.gpio] = 1
    } else {
      return false
    }

    this.write({ device, state: 1 })

    setTimeout(() => {
      this.write({ device, state: 0 })

      this.jobs[device.gpio] = 0
    }, duration)

    return { state: 1, duration }
  }

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
