const Service = require('./service')
const Gpio = require('onoff').Gpio

class Pi extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'RASPBERRY_PI'
  }

  addDevice({ device }) {
    let gpioHook = null
    let state = null
    if (Gpio.accessible) {
      gpioHook = new Gpio(device.gpio, device.input ? 'in' : 'out', 'both', {
        debounceTimeout: device.debounce,
        activeLow: device.inverted,
      })

      state = gpioHook.readSync()
    } else {
      this.consoleLog({
        device,
        message: 'Device cannot be initialised as the GPIO is inaccessible',
        colour: 31,
      })
    }

    this.devices.push({ ...device.dataValues, state, gpioHook })
  }

  initialize() {
    // setup watch callback for input devices
    this.devices.forEach((d) => {
      try {
        if (Gpio.accessible) {
          if (d.input) {
            d.gpioHook.watch((err, value) => {
              if (err) console.log(err)
              this.updateState({ device: d, state: value })
            })
          }
        }
      } catch (e) {
        console.log(e)
      }
    })
  }

  devicePulse({ device }) {
    // if device duration is null we are assuming that the device is a toggle
    if (device.duration === null) {
      return this.toggle({ device })
    } else {
      return this.relayTrigger({
        device: device,
        duration: device.duration,
      })
    }
  }

  toggle({ device }) {
    try {
      const state = !this.getDevice({ deviceId: device.id }).state
      this.setState({ device, state })
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  relayTrigger({ device, duration }) {
    try {
      /* const isActive = this.getDevice({ deviceId: device.id })
        ? this.getDevice({ deviceId: device.id }).state
        : false */

      /* if (isActive) {
        clearTimeout(this.getDevice({ deviceId: device.id }).timeout)
        this.setState({ device, state: 0 })
        return true
      } */

      // This just cancels all active devices to prevent the garage door screwing up.
      // Ideally it would only cancel specific devices, but... this works for me for now.

      const activeDevices = this.getDevices().filter((d) => {
        if (d.duration !== null && d.state === 1) return d
        return false
      })

      if (activeDevices.length > 0) {
        activeDevices.forEach((d) => {
          clearTimeout(d.timeout)
          this.setState({ device: d, state: 0 })
        })

        return true
      }

      // End of hack

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

  setState({ device, state }) {
    if (Gpio.accessible) {
      device.gpioHook.writeSync(state ? 1 : 0)

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
          'Pin cannot be set to ' + state + ' as the GPIO is inaccessible',
        colour: 31,
      })
    }
  }

  setTimeout({ device, timeout }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.timeout = timeout
      return d
    })
  }
}

module.exports = Pi
