const { Sequelize } = require('sequelize')

module.exports.createStore = () => {

  const db = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      dialect: 'postgres',
      logging: false,
    }
  )

  db.authenticate()
    .then(() => {
      console.log('Connection to database has been established successfully.')
    })
    .catch((err) => {
      console.log('Unable to connect to the database:', err)
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

  const subscriptions = db.define('subscription', {
    createdAt: Sequelize.DATE,
    endpoint: Sequelize.STRING,
    p256dh: Sequelize.STRING,
    auth: Sequelize.STRING,
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
    input: Sequelize.BOOLEAN,
    icon: Sequelize.STRING,
    color: Sequelize.STRING,
    deviceType: Sequelize.STRING,
    tuyaId: Sequelize.STRING,
    tuyaKey: Sequelize.STRING,
    signal: Sequelize.STRING,
  })

  alerts.belongsTo(devices, { foreignKey: 'deviceId' })
  devices.hasMany(alerts)

  return { db, alerts, devices, users, subscriptions }
}
