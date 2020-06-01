class Alarm {

    pubsub
    store

    constructor({pubsub, store}) {
        this.pubsub = pubsub
        this.store = store
    }

    alert = ({ sensorName }) => {
        console.log(sensorName)
        const time = Date.now()

        this.store.alerts.create({
            sensorName: sensorName
        })

        this.pubsub.publish("ALERT", {
            alert: {
                createdAt: time,
                sensorName: sensorName
            }
        })
    }

    setAlarmState() {
        
    }

}

module.exports = Alarm;