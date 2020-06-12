const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    atmospheres: [Atmosphere]
    alerts: [Alert]
    devices: [Device]
    alarmDevices: [Device]
    alarmStatus: String!
    outputDevices: [Device]
    piStatus: PiStatus
  }
  type Mutation {
    devicePulse(id: ID!): DeviceState
    alarmState(state: String!): Boolean
    login(email: String!, password: String!): LoginResponse!
    register(email: String!, password: String!): Boolean
  }
  type LoginResponse {
    token: String
    success: Boolean
  }
  type DeviceState {
    state: Boolean
    duration: Int
  }
  type PiStatus {
    temp: Float
  }
  type Subscription {
    alarmStatus: String
    alarmDevices: [Device]
  }
  type Atmosphere {
    id: ID!
    temperature: Float!
    humidity: Float!
    createdAt: String!
    updatedAt: String!
  }
  type Alert {
    id: ID!
    createdAt: String!
    updatedAt: String!
    deviceId: ID!
    device: Device
  }
  type Device {
    id: ID!
    createdAt: String!
    updatedAt: String!
    name: String!
    gpio: Int
    debounce: Int
    inverted: Boolean
    duration: Int
    alarmDevice: Boolean
    alarmTriggered: Boolean
    alerts: [Alert]
    input: Boolean
    color: String
    icon: String
  }
`

module.exports = typeDefs
