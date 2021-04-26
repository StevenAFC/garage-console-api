class Messages {
  constructor({ store, webPush }) {
    this.store = store
    this.webPush = webPush
  }

  async sendMessage({ title, message }) {
    const payload = JSON.stringify({
      title,
      message,
    })

    const subscriptions = await this.store.subscriptions.findAll()

    subscriptions.forEach((s) => {
      const subscriber = {
        endpoint: s.endpoint,
        expirationTime: null,
        keys: {
          p256dh: s.p256dh,
          auth: s.auth,
        },
      }

      this.webPush.sendNotification(subscriber, payload).catch((error) => {
        if (error.statusCode === 410) {
          this.store.subscriptions.destroy({
            where: {
              id: s.id,
            },
          })
        }
        console.log(error.statusCode)
      })
    })
  }
}

module.exports = Messages
