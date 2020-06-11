const { DataSource } = require('apollo-datasource')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

class UserAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async login({ email, password }) {
    console.log('Login attempt: ' + email)

    const user = await this.store.users.findOne({
      where: {
        email,
        approved: 1,
      },
    })

    if (user && bcrypt.compareSync(password, user.password)) {
      return {
        token: jwt.sign(user.toJSON(), process.env.SECRET),
        success: true,
      }
    } else {
      return {
        token: null,
        success: false,
      }
    }
  }

  async register({ email, password }) {
    try {
      await this.store.users.create({
        email,
        password: await bcrypt.hash(password, 10),
      })
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }

  authenticate({ req }) {
    const { token } = req.headers

    if (jwt.verify(token, process.env.SECRET)) {
      return true
    } else {
      return false
    }
  }
}

module.exports = UserAPI
