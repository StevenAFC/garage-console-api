const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        me: User
        Atmospheres: [Atmosphere]
        openGarageDoor: Boolean
    }
    type Subscription {
        something: Float
    }
    type User {
        id: ID!
        email: String!
    }
    type Atmosphere {
        id: ID!
        temperature: Float!
        humidity: Float!
        createdAt: String!
        updatedAt: String!
    }
`;

module.exports = typeDefs;