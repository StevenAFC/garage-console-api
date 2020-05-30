const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        me: User
        Atmospheres: [Atmosphere]
    }
    type Mutation {
        login(email: String): String
    }
    type User {
        id: ID!
        email: String!
    }
    type Atmosphere {
        id: ID!
        temperature: Float!
        humidity: Float!
        date: String!
    }
`;

module.exports = typeDefs;