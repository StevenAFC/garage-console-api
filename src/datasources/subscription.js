const { DataSource } = require('apollo-datasource')

class SubscriptionAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async subscribe({ endpoint, p256dh, auth }) {
    try {
      await this.store.subscriptions.create({
        endpoint,
        p256dh,
        auth,
      })
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }

  async getSubscriptions() {
    const found = await this.store.subscriptions.findAll()
    return found
  }
}

module.exports = SubscriptionAPI
