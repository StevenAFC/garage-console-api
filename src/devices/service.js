class Service {
  deviceType = null

  constructor({ pubsub }) {
    this.pubsub = pubsub
    this.devices = []
  }

  async addDevice({ device }) {
    this.devices.push({ ...device.dataValues, state: null })
  }

  getDevices() {
    return this.devices
  }

  getDevice({ deviceId }) {
    return this.devices.find((d) => {
      return d.id === deviceId
    })
  }

  updateState({ device, state }) {
    let stateChanged = false

    this.devices = this.devices.map((d) => {
      if (d.id === device.id) {
        if (d.state != state) {
          d.state = state
          stateChanged = true
        }
      }
      return d
    })

    if (stateChanged) {
      this.pubsub.publish('DEVICE_STATE', {
        deviceState: { id: device.id, state },
      })

      this.consoleLog({
        device,
        message: 'state has been changed to ' + state,
        colour: 33,
      })
    }
  }

  async setState() {}

  async initialize() {}

  async devicePulse() {}

  async watchInputDevice() {}

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
              device.deviceType +
              ') ' +
              message +
              '\u001b[0m'
        )
        : console.log('\u001b[' + colour + 'm' + message + '\u001b[0m')
    }
}

module.exports = Service
