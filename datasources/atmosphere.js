const { DataSource } = require('apollo-datasource')

class AtmosphereAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async getAtmospheres() {
    const found = await this.store.atmospheres.findAll()
    return found
  }
}

module.exports = AtmosphereAPI
