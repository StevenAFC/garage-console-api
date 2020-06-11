const { Sequelize } = require('sequelize')

module.exports.createStore = () => {
  const db = new Sequelize({
    dialect: 'sqlite',
    storage: './store.sqlite',
  })

  const users = db.define('user', {
    createdAt: Sequelize.DATE,
    email: {
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: { isEmail: true, notEmpty: true },
      type: Sequelize.STRING,
    },
    password: Sequelize.STRING,
    approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  })

  const atmospheres = db.define('atmosphere', {
    createdAt: Sequelize.DATE,
    temperature: Sequelize.FLOAT,
    humidity: Sequelize.FLOAT,
  })

  const alerts = db.define('alert', {
    createdAt: Sequelize.DATE,
    deviceId: Sequelize.INTEGER,
  })

  const devices = db.define('device', {
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    name: {
      type: Sequelize.STRING,
      unique: true,
    },
    gpio: Sequelize.INTEGER,
    debounce: Sequelize.INTEGER,
    inverted: Sequelize.BOOLEAN,
    duration: Sequelize.INTEGER,
    alarmDevice: Sequelize.BOOLEAN,
    alarmTriggered: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    input: Sequelize.BOOLEAN,
  })

  alerts.belongsTo(devices, { foreignKey: 'deviceId' })

  devices.hasMany(alerts)

  db.sync()

  return { db, atmospheres, alerts, devices, users }
}
