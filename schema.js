const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        atmospheres: [Atmosphere]
        alerts: [Alert]
        devices: [Device]
        getAlarmDevices: [Device]
        openGarageDoor: Boolean
        closeGarageDoor: Boolean
    }
    type Mutation {
        devicePulse(id: ID): Boolean
    }
    type Subscription {
        doorStatus: String
        alarmStatus: AlarmState
        alert: Alert
    }
    type Atmosphere {
        id: ID!
        temperature: Float!
        humidity: Float!
        createdAt: String!
        updatedAt: String!
    }
    type AlarmState {
        state: String
    }
    type Alert {
        id: ID!
        createdAt: String!
        updatedAt: String!
        deviceId: ID!
        device: Device
    }
    type Device {
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
    }
`;

module.exports = typeDefs;