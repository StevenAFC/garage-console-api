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
        const [code, proto, pulse] = parts.map(Number)
        console.log(`Received RF code: ${code} (protocol ${proto}, pulselength ${pulse}μs)`)
        this.pubsub.publish('RF_SIGNAL_RECEIVED', {
          rfSignalReceived: { code },
        })
      } else {
        console.log('RF Receiver:', message)
      }
    })

    this.shell.on('stderr', (err) => {
      console.error('RF Receive stderr:', err)
    })

    this.shell.on('error', (err) => {
      console.error('RF Receive error:', err)
      this.shell = null
    })

    this.shell.on('close', () => {
      console.log('RF Receive process closed')
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
