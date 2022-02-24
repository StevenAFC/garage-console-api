const Service = require('./service')

class Mqtt extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'MQTT'
    this.mqttClient = mqtt
  }

  async addDevice({ device }) {
    this.devices.push({ ...device.dataValues })
  }

  async initialize() {
    this.devices.forEach((d) => {
      const config = JSON.parse(d.config)
      this.mqttClient.subscribe(config.topic, (message) =>
        this.setState({ device: d, state: message })
      )
    })
  }

  setState({ device, state }) {
    const config = JSON.parse(device.config)
    let output

    if (config.path) {
      output = config.path.split('.').reduce((p, prop) => {
        return p[prop]
      }, JSON.parse(state))
    } else {
      output = state
    }

    this.updateState({ device, state: (output >= 1 ? 1 : 0) ^ device.inverted })
  }
}

module.exports = Mqtt
