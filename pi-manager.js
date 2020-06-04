const Gpio = require('onoff').Gpio

class PiManager {
  constructor({ pubsub, store }) {
    this.pubsub = pubsub
    this.store = store
    this.jobs = {}
    this.devices = []
  }

  initializeDevice({ device }) {
    this.devices.forEach((d) => {
      if (d.id === device.id) return
    })

    let pin = null
    if (Gpio.accessible) {
      pin = new Gpio(device.gpio, device.input ? 'in' : 'out', 'falling', {
        debounceTimeout: device.debounce,
        activeLow: device.inverted,
      })
    }

    this.devices.push({ id: device.id, gpio: device.gpio, pin: pin })
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
        console.log(
          '\u001b[' +
            32 +
            'm' +
            'GPIO ' +
            device.gpio +
            ' has been initialised' +
            '\u001b[0m'
        )
      } else {
        console.log(
          '\u001b[' +
            31 +
            'm' +
            'GPIO ' +
            device.gpio +
            ' pin cannot be initialised as the GPIO is inaccessible' +
            '\u001b[0m'
        )
      }
    } catch (e) {
      console.log(e)
    }
  }

  async relayLatch({ device, state }) {
    this.initializeDevice({ device })

    if (Gpio.accessible) {
      this.getDevice({ device }).pin.writeSync(state)
      console.log(
        '\u001b[' +
          32 +
          'm' +
          'Device ' +
          device.name +
          ' (' +
          device.gpio +
          ') has been set to ' +
          state +
          '\u001b[0m'
      )
    } else {
      console.log(
        '\u001b[' +
          31 +
          'm' +
          'Device ' +
          device.name +
          ' (' +
          device.gpio +
          ') pin cannot be set to high as the GPIO is inaccessible' +
          '\u001b[0m'
      )
    }
  }

  async relayTrigger({ device, duration }) {
    try {
      if (!this.jobs[device.gpio]) {
        this.jobs[device.gpio] = 1
      } else {
        return false
      }

      this.initializeDevice({ device })

      if (Gpio.accessible) {
        this.getDevice({ device }).pin.writeSync(1)
        console.log(
          '\u001b[' +
            32 +
            'm' +
            'Device ' +
            device.name +
            ' (' +
            device.gpio +
            ') has been set to high for ' +
            duration +
            'ms' +
            '\u001b[0m'
        )
      } else {
        console.log(
          '\u001b[' +
            31 +
            'm' +
            'Device ' +
            device.name +
            ' (' +
            device.gpio +
            ') pin cannot be set to high as the GPIO is inaccessible' +
            '\u001b[0m'
        )
      }

      setTimeout(() => {
        if (Gpio.accessible) {
          this.getDevice({ device }).pin.writeSync(0)
          console.log(
            '\u001b[' +
              32 +
              'm' +
              'Device ' +
              device.name +
              ' (' +
              device.gpio +
              ') pin been set to low' +
              '\u001b[0m'
          )
        } else {
          console.log(
            '\u001b[' +
              31 +
              'm' +
              'Device ' +
              device.name +
              ' (' +
              device.gpio +
              ') pin cannot be set to low as the GPIO is inaccessible' +
              '\u001b[0m'
          )
        }

        this.jobs[device.gpio] = 0
      }, duration)

      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

module.exports = PiManager
