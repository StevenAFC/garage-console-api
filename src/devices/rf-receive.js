const Service = require('./service')
const { PythonShell } = require('python-shell')
const path = require('path')

class RfReceive extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'RF_RECEIVE'
  }

  initialize({ device }) {
    this.device = device
    this.start()
  }

  async start() {
    const scriptPath = path.join(__dirname, 'rf-receive.py')
    const shell = new PythonShell(scriptPath, {
      args: [this.device.gpio],
    })

    shell.on('message', (message) => {
      console.log('Received RF Signal:', message)
      this.pubsub.publish('RF_SIGNAL_RECEIVED', {
        rfSignalReceived: {
          signal: message,
        },
      })
    })
  }
}

module.exports = RfReceive
