class Alarm {

    pubsub
    store

    constructor({pubsub, store}) {
        this.pubsub = pubsub
        this.store = store
    }

    alert = ({ deviceId }) => {
        console.log(deviceId)
        const time = Date.now()

        this.store.alerts.create({
            deviceId: deviceId
        })

        this.pubsub.publish("ALERT", {
            alert: {
                createdAt: time,
                deviceId: deviceId
            }
        })
    }

    setAlarmState() {
        
    }

}

module.exports = Alarm;