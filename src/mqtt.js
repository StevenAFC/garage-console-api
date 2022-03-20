const mqttclient = require('mqtt')

class Mqtt {
  constructor() {
    this.mqttClient = mqttclient.connect(`mqtt://${process.env.MQTT_HOST}`, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 1000,
    })

    this.lastMessage = {}

    this.subscribed = []

    this.mqttClient.on('connect', (e) => {
      console.log('MQTT Connected')
    })

    this.mqttClient.on('error', (e) => {
      console.log(`MQTT Client: ${e}`)
      this.mqttClient.reconnect()
    })

    this.mqttClient.on('message', (topic, message) => {
      this.lastMessage[topic] = message.toString()
      this.subscribed
        .filter((s) => s.topic === topic && s.cb !== undefined)
        .forEach((s) => {
          s.cb(message.toString())
        })
    })
  }

  subscribe(topic, cb) {
    if (this.subscribed.some((s) => s.topic === topic)) return
    this.mqttClient.subscribe(topic)
    this.subscribed.push({ topic, cb })
  }

  getLast(topic) {
    return topic in this.lastMessage ? this.lastMessage[topic] : false
  }

  publish({ topic, message }) {
    this.mqttClient.publish(topic, message)
  }
}

module.exports = Mqtt
