const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        Atmospheres: [Atmosphere]
        alerts: [Alert]
        openGarageDoor: Boolean
        closeGarageDoor: Boolean
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
        sensorName: String!
        createdAt: String!
        updatedAt: String!
    }
`;

module.exports = typeDefs;