const Service = require('./service')
const Gpio = require('onoff').Gpio

class Pi extends Service {
  deviceType = 'RASPBERRY_PI'

  async addDevice({ device }) {
    let gpioHook = null
    if (Gpio.accessible) {
      gpioHook = new Gpio(device.gpio, device.input ? 'in' : 'out', 'falling', {
        debounceTimeout: device.debounce,
        activeLow: device.inverted,
      })
    }

    this.devices.push({ ...device.dataValues, gpioHook, state: false })
  }

  async initialize() {
    this.devices.map((d) => {
      try {
        if (Gpio.accessible) {
          this.updateState({ device: d, state: d.gpioHook.readSync() })
        }
      } catch (e) {
        console.log(e)
      }
    })
  }

  async devicePulse({ device }) {
    // if device duration is null we are assuming that the device is a toggle
    if (device.duration === null) {
      return await this.toggle({ device })
    } else {
      return await this.relayTrigger({
        device: device,
        duration: device.duration,
      })
    }
  }

  async toggle({ device }) {
    try {
      const state = !this.getDevice({ deviceId: device.id }).state
      this.setState({ device, state })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async relayLatch({ device, state }) {
    this.setState({ device, state })
  }

  async relayTrigger({ device, duration }) {
    try {
      const isActive = this.getDevice({ deviceId: device.id })
        ? this.getDevice({ deviceId: device.id }).state
        : false

      if (isActive) {
        clearTimeout(this.getDevice({ deviceId: device.id }).timeout)
        this.setState({ device, state: 0 })
        return true
      }

      this.setState({ device, state: 1 })

      this.setTimeout({
        device,
        timeout: setTimeout(() => {
          this.setState({ device, state: 0 })
        }, duration),
      })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  setTimeout({ device, timeout }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.timeout = timeout
      return d
    })
  }

  setState({ device, state }) {
    try {
      if (Gpio.accessible) {
        this.getDevice({ deviceId: device.id }).gpioHook.writeSync(
          state ? 1 : 0
        )
        this.updateState({ device, state })

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

  async watchInputDevice({ device, cb }) {
    try {
      if (Gpio.accessible) {
        this.getDevice({ deviceId: device.id }).gpioHook.watch(() => {
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
}

module.exports = Pi
