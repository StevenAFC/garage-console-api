const Service = require('./service')
const { PythonShell } = require('python-shell')
const path = require('path')

class RfReceive extends Service {
  constructor({ pubsub, mqtt }) {
    super({ pubsub, mqtt })
    this.deviceType = 'RF_RECEIVE'
    this.shell = null
  }

  initialize({ device } = {}) {
    if (!device || this.device) return
    this.device = device
    this.start()
  }

  start() {
    if (this.shell || !this.device) return
    const scriptPath = path.join(__dirname, 'rf-receive.py')
    this.shell = new PythonShell(scriptPath, {
      args: [this.device.gpio],
    })

    this.shell.on('message', (message) => {
      const parts = message.split(',')
      if (parts.length === 3) {
        const [code, protocol, pulselength] = parts.map(Number)
        console.log(`Received RF code: ${code} (protocol ${protocol}, pulselength ${pulselength}μs)`)
        this.pubsub.publish('RF_SIGNAL_RECEIVED', {
          rfSignalReceived: { code, protocol, pulselength },
        })
      } else {
        console.log('RF Receiver:', message)
      }
    })

    this.shell.on('error', (err) => {
      console.error('RF Receive error:', err)
      this.shell = null
    })
  }

  pause() {
    if (this.shell) {
      this.shell.kill()
      this.shell = null
      console.log('RF Receiver paused for transmission')
    }
  }

  resume() {
    console.log('RF Receiver resuming')
    this.start()
  }
}

module.exports = RfReceive
