const TuyAPI = require('tuyapi')

class TuyaManager {
  constructor({ pubsub, store }) {
    this.pubsub = pubsub
    this.store = store
    this.devices = []

    this.initialize()
  }

  async initialize() {
    const devices = await this.store.devices.findAll({
      where: {
        deviceType: 'TUYA',
      },
    })
  }

  getDevices() {
    return this.devices
  }

  async getState({ device }) {
    const d = new TuyAPI({
      id: device.tuyaId,
      key: device.tuyaKey,
    })

    try {
      await d.find()

      await d.connect()

      let state = await d.get()

      return state
    } catch (e) {
      console.log(e)
    }
  }

  async toggle({ device }) {
    const d = new TuyAPI({
      id: device.tuyaId,
      key: device.tuyaKey,
    })

    try {
      await d.find()

      await d.connect()

      let state = await d.get()

      await d.set({ set: !state })

      state = await d.get()

      console.log(state)

      this.pubsub.publish('DEVICE_STATE', {
        deviceState: { id: device.id, state },
      })
      this.consoleLog({
        device,
        message: 'has been set to: ' + state,
        colour: 32,
      })

      d.disconnect()
    } catch (e) {
      console.log(e)
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
            device.tuyaId +
            ') ' +
            message +
            '\u001b[0m'
      )
      : console.log('\u001b[' + colour + 'm' + message + '\u001b[0m')
  }
}

module.exports = TuyaManager
