class Alarm {
  constructor({ pubsub, store, deviceManager, messages }) {
    this.pubsub = pubsub
    this.store = store
    this.deviceManager = deviceManager
    this.messages = messages
    this.state = 'DISARMED'

    this.setAlarmState('DISARMED')
    this.consoleLog({
      message: '🚨 Alarm state is set to DISARMED',
      colour: 32,
    })

    this.pubsub.subscribe('DEVICE_STATE', (data) => this.alert(data))
  }

  async alert({ device }) {
    if (device.input && device.alarmDevice && device.state === 0) {
      if (this.state !== 'ARMED') {
        this.consoleLog({
          device,
          message: 'has been triggered however the alarm is not armed',
          colour: 36,
        })

        return true
      }

      this.consoleLog({
        device,
        message: 'has been tripped',
        colour: 31,
      })

      this.store.alerts.create({
        deviceId: device.id,
      })

      this.refreshDevices()

      this.setAlarmState('ALERTED')
    }
  }

  async refreshDevices() {
    const devices = await this.store.devices.findAll({
      where: {
        alarmDevice: true,
        input: true,
      },
      include: [
        {
          model: this.store.alerts,
          limit: 1,
          order: [['createdAt', 'DESC']],
        },
      ],
    })

    this.pubsub.publish('ALARM_DEVICES', {
      alarmDevices: devices,
    })
  }

  triggerAlarm() {
    this.consoleLog({
      message: '🚨 Alarm has been triggered!!!',
      colour: 31,
    })

    this.messages.sendMessage({
      title: '🚨 Alarm',
      message: 'Garage alarm has been triggered!!!',
      tag: 'alarm-triggered',
    })

    const outputDevices = this.deviceManager.getDevices().filter((d) => {
      return d.alarmDevice && !d.input
    })

    outputDevices.forEach((d) => {
      this.deviceManager.setState({ device: d, state: true })
    })
  }

  silenceAlarm() {
    if (this.getState() === 'ALERTED') {
      this.consoleLog({
        message: '🚨 Alarm has been silenced',
        colour: 36,
      })

      this.messages.sendMessage({
        title: '🚨 Alarm',
        message: 'Alarm has been silenced',
        tag: 'alarm-triggered',
      })

      const outputDevices = this.deviceManager.getDevices().filter((d) => {
        return d.alarmDevice && !d.input
      })

      outputDevices.forEach((d) => {
        this.deviceManager.setState({ device: d, state: false })
      })
    }
  }

  getState() {
    return this.state
  }

  setState(state) {
    this.state = state

    this.consoleLog({
      message: 'Alarm State has been changed to ' + state,
      colour: 36,
    })

    this.messages.sendMessage({
      title: '🚨 Alarm state change',
      message: 'Alarm State has been changed to ' + state,
      tag: 'alarm-state-change',
    })

    this.pubsub.publish('ALARM_STATUS', {
      alarmStatus: this.state,
    })
  }

  setAlarmState(state) {
    switch (state) {
      case 'DISARMED':
        this.silenceAlarm()
        this.setState(state)
        break
      case 'ARMED':
        this.setState(state)
        break
      case 'ALERTED':
        this.triggerAlarm()
        // turn alarm off automatically after 2 minutes
        setTimeout(() => {
          this.consoleLog({
            message: 'Alarm has been disarmed automatically',
            colour: 36,
          })
          this.setAlarmState('DISARMED')
        }, 120000)
        this.setState(state)
        break
      default:
        this.consoleLog({
          message: 'Invalid alarm state: ' + state,
          colour: 36,
        })
        break
    }
  }

  // prettier-ignore
  consoleLog({ device, message, colour }) {
    device
      ? console.log(
        '\u001b[' +
              colour +
              'm' +
              '🚨 Device: ' +
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

module.exports = Alarm
