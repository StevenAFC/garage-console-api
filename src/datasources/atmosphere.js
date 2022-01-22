const { DataSource } = require('apollo-datasource')

class AtmosphereAPI extends DataSource {
  constructor({ store, mqtt }) {
    super()
    this.store = store
    this.mqtt = mqtt
    this.topic = process.env.MQTT_ENVIRONMENTAL_TOPIC
  }

  initialize(config) {
    this.context = config.context
    this.mqtt.subscribe(this.topic)
  }

  async getAtmosphere() {
    const atmosphere = JSON.parse(this.mqtt.getLast(this.topic))

    return {
      temperature: atmosphere ? atmosphere.temperature : 0,
      humidity: atmosphere ? atmosphere.humidity : 0,
    }
  }
}

module.exports = AtmosphereAPI
