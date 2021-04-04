class Alarm {
  constructor({ pubsub, store, deviceManager }) {
    this.pubsub = pubsub
    this.store = store
    this.deviceManager = deviceManager
    this.status = 'DISARMED'
  }

  async initialise() {
    console.log('Initialising alarm IO')
    this.setAlarmState('DISARMED')
    const inputDevices = await this.store.devices.findAll({
      where: {
        input: true,
        alarmDevice: true,
      },
    })

    inputDevices.map((device) => {
      this.deviceManager.watchInputDevice({
        device,
        cb: () => this.alert(device),
      })
    })
  }

  async alert(device) {
    if (this.status === 'DISARMED') {
      this.consoleLog({
        device,
        message: 'has been triggered however the alarm is not armed',
        colour: 34,
      })

      return true
    }

    this.consoleLog({
      device,
      message: 'has been triggered',
      colour: 32,
    })

    this.store.alerts.create({
      deviceId: device.id,
    })

    await this.store.devices.update(
      { alarmTriggered: true },
      { where: { id: device.id } }
    )

    this.refreshDevices()

    this.triggerAlarm(1)

    return true
  }

  async triggerAlarm(state) {
    this.consoleLog({
      message: 'Alarm state changed to: ' + state,
      colour: 34,
    })

    const outputDevices = await this.store.devices.findAll({
      where: {
        input: false,
        alarmDevice: true,
      },
    })

    outputDevices &&
      outputDevices.map((device) => {
        this.consoleLog({
          device,
          message: 'Alarm Output Device',
          colour: 32,
        })

        this.deviceManager.setState({ device: device, state })
      })
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

  getAlarmState() {
    return this.status
  }

  alarmState(state) {
    this.status = state

    this.consoleLog({
      message: 'Alarm State has been changed to ' + state,
      colour: 32,
    })

    this.pubsub.publish('ALARM_STATUS', {
      alarmStatus: this.status,
    })
  }

  async setAlarmState(state) {
    switch (state) {
      case 'DISARM':
        await this.store.devices.update(
          { alarmTriggered: false },
          { where: { alarmTriggered: true } }
        )
        this.refreshDevices()
        this.alarmState('DISARMED')
        this.triggerAlarm(0)
        this.consoleLog({
          device: null,
          message: 'Siren silenced ' + state,
          colour: 32,
        })
        break
      case 'ARM':
        this.alarmState('ARMED')
        this.refreshDevices()
        break
      default:
        return false
    }

    return true
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
              device.deviceType +
              ') ' +
              message +
              '\u001b[0m'
        )
        : console.log('\u001b[' + colour + 'm' + message + '\u001b[0m')
    }
}

module.exports = Alarm
