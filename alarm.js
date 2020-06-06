class Alarm {
  constructor({ pubsub, store, piManager }) {
    this.pubsub = pubsub
    this.store = store
    this.piManager = piManager
    this.status = 'DISARMED'
  }

  async initialise() {
    console.log('Initialising alarm IO')
    this.setAlarmState('DISARMED')
    const inputDevices = await this.store.devices.findAll({
      where: {
        input: 1,
        alarmDevice: 1,
      },
    })

    inputDevices.map((device) => {
      this.piManager.watchInputDevice({ device, cb: () => this.alert(device) })
    })
  }

  async alert(device) {
    if (this.status === 'DISARMED') {
      this.piManager.consoleLog({
        device,
        message: 'has been triggered however the alarm is not armed',
        colour: 34,
      })

      return true
    }

    this.piManager.consoleLog({
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
    this.piManager.consoleLog({
      message: 'Alarm state changed to: ' + state,
      colour: 34,
    })

    const outputDevices = await this.store.devices.findAll({
      where: {
        input: 0,
        alarmDevice: 1,
      },
    })

    outputDevices &&
      outputDevices.map((device) => {
        this.piManager.consoleLog({
          device,
          message: 'Alarm Output Device',
          colour: 32,
        })

        this.piManager.relayLatch({ device: device, state })
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

    this.piManager.consoleLog({
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
        this.piManager.consoleLog({
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
}

module.exports = Alarm
