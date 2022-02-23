const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    atmosphere: Atmosphere
    alerts: [Alert]
    devices(input: Boolean, alarmDevice: Boolean): [Device]
    deviceState(id: ID!): Boolean
    alarmStatus: String!
    piStatus: PiStatus
  }
  type Mutation {
    devicePulse(id: ID!): Boolean
    alarmState(state: String!): Boolean
    login(email: String!, password: String!): LoginResponse!
    register(email: String!, password: String!): Boolean
    subscribe(endpoint: String!, p256dh: String!, auth: String!): Boolean
  }
  type Subscription {
    alarmStatus: String
    alarmDevices: [Device]
    deviceState: Device
  }
  type LoginResponse {
    token: String
    success: Boolean
  }
  type PiStatus {
    temp: Float
    totalMemory: Float
    freeMemory: Float
    usedMemory: Float
    cpuLoad: Float
  }
  type Atmosphere {
    temperature: Float!
    humidity: Float!
  }
  type Alert {
    id: ID!
    createdAt: String!
    updatedAt: String!
    deviceId: ID!
    device: Device
  }
  enum DeviceType {
    RASPBERRY_PI
    TUYA
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
    alerts: [Alert]
    input: Boolean
    color: String
    icon: String
    deviceType: DeviceType
    config: String
    state: Boolean
  }
`

module.exports = typeDefs
