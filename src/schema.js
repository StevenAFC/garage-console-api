const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    atmosphere: Atmosphere
    alerts: [Alert]
    devices: [Device]
    deviceState(id: ID!): Boolean
    deviceStates: [DeviceStatus]
    alarmDevices: [Device]
    alarmStatus: String!
    outputDevices: [Device]
    piStatus: PiStatus
  }
  type Mutation {
    devicePulse(id: ID!): Boolean
    alarmState(state: String!): Boolean
    login(email: String!, password: String!): LoginResponse!
    register(email: String!, password: String!): Boolean
    subscribe(endpoint: String!, p256dh: String!, auth: String!): Boolean
  }
  type LoginResponse {
    token: String
    success: Boolean
  }
  type DeviceStatus {
    device: Device
    state: DeviceState
  }
  type DeviceState {
    id: Int!
    state: Boolean
  }
  type PiStatus {
    temp: Float
    totalMemory: Float
    freeMemory: Float
    usedMemory: Float
    cpuLoad: Float
  }
  type Subscription {
    alarmStatus: String
    alarmDevices: [Device]
    deviceState: DeviceState
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
    tuya_id: String
    tuya_key: String
    signal: String
  }
`

module.exports = typeDefs
