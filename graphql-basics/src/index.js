/*import location, {getGreeting, message, name} from "./myModule"; // location is the default export
import add, {subtract} from "./math";

console.log(message, name, location);
console.log(getGreeting(name));

console.log(add(2, 3));
console.log(subtract(3, 3));*/

import { GraphQLServer, PubSub } from "graphql-yoga";
// import { ApolloServer, gql } from "apollo-server";
import db from "./db";
import Mutation from "./resolver/Mutation";
import Query from "./resolver/Query";
import { Post, User } from "./resolver/TypeTransformation";
import * as path from "path";
import Subscription from "./resolver/Subscription";

// 5 Scalar types = String, Boolean, Int, Float, ID (unique identifier)
// Type definition (schema)

const pubsub = new PubSub();

// const typeDefs = gql`
//   ${fs.readFileSync(path.resolve(__dirname, "schema.graphql").toString())}
// `;
const typeDefs = path.resolve(__dirname, "schema.graphql").toString();
const resolvers = {
  Mutation,
  Query,
  Post,
  User,
  Subscription,
};
const context = {
  db,
  pubsub,
};
const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context,
  csrfPrevention: true,
  cache: "bounded",
});

server.start().then(({ url }) => console.log(`Server ready at ${url}`));

// server.listen().then(({ url }) => {
//   console.log(`Server ready at ${url}`);
// });
