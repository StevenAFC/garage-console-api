const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    atmospheres: [Atmosphere]
    alerts: [Alert]
    devices: [Device]
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
    temp: Int
    totalMemory: Int
    freeMemory: Int
    usedMemory: Int
    cpuLoad: Int
  }
  type Subscription {
    alarmStatus: String
    alarmDevices: [Device]
    deviceState: DeviceState
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
    alarmTriggered: Boolean
    alerts: [Alert]
    input: Boolean
    color: String
    icon: String
    deviceType: DeviceType
    tuya_id: String
    tuya_key: String
  }
`

module.exports = typeDefs
