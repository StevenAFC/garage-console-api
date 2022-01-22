const mqttclient = require('mqtt')

class Mqtt {
  constructor() {
    this.mqttClient = mqttclient.connect(`mqtt://${process.env.MQTT_HOST}`, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 1,
    })

    this.lastMessage = {}

    this.subscribed = []

    this.mqttClient.on('connect', function (e) {
      console.log('MQTT Connected')
    })

    this.mqttClient.on('error', function (e) {
      console.log(e)
      this.mqttClient.end()
    })

    this.mqttClient.on('message', (topic, message) => {
      this.lastMessage[topic] = message.toString()
    })
  }

  subscribe(topic) {
    if (this.subscribed.includes(topic)) return
    this.mqttClient.subscribe(topic)
    this.subscribed.push(topic)
  }

  getLast(topic) {
    return topic in this.lastMessage ? this.lastMessage[topic] : false
  }

  publish({ topic, message }) {
    this.mqttClient.publish(topic, message)
  }
}

module.exports = Mqtt
