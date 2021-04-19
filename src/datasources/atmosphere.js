const { DataSource } = require('apollo-datasource')
const { Op, Sequelize } = require('sequelize')
const moment = require('moment')

class AtmosphereAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async getAtmospheres() {
    return await this.store.atmospheres.findAll({
      where: {
        createdAt: {
          [Op.gte]: moment().subtract(7, 'days').toDate(),
        },
      },
      attributes: {
        include: [
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'temperature'],
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'humidity'],
          [
            Sequelize.fn('date_trunc', 'hour', Sequelize.col('createdAt')),
            'createdAt',
          ],
        ],
        exclude: ['id', 'createdAt', 'updatedAt', 'temperature', 'humidity'],
      },
      group: 'createdAt',
      raw: true,
    })
  }
}

module.exports = AtmosphereAPI
