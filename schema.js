const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    atmospheres: [Atmosphere]
    alerts: [Alert]
    devices: [Device]
    alarmDevices: [Device]
    alarmStatus: String!
  }
  type Mutation {
    devicePulse(id: ID!): Boolean
    alarmState(state: String!): Boolean
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
  }
`

module.exports = typeDefs
