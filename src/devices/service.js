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

  getDevice({ device }) {
    this.devices.map((d) => {
      if (d.id === device.id) return d
    })
  }

  updateState({ device, state }) {
    this.devices = this.devices.map((d) => {
      if (d.id === device.id) d.state = state
      return d
    })

    this.pubsub.publish('DEVICE_STATE', {
      deviceState: { id: device.id, state },
    })
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
