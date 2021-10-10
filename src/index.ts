import 'reflect-metadata';
import mongoose from 'mongoose';
import { getSchema } from './graphql/schema';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';

const main = async () => {
  const schema = await getSchema();
  const server = new ApolloServer({ schema });

  const app = express();

  await server.start();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      saveUninitialized: false,
      secret: 'keyboard cat',
      resave: false,
    })
  );

  server.applyMiddleware({ app });

  mongoose
    .connect(
      'mongodb://localhost:27017/lireddit?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
    )
    .then(() => {
      console.log('mongodb connected');
      const port = process.env.PORT || 5000;
      app.listen({ port }, () =>
        console.log(
          `🚀 Server ready at http://localhost:${port + server.graphqlPath}`
        )
      );
    })
    .catch((err: any) => {
      console.error(err);
    });
};

main().catch((err: any) => {
  console.log('server start error: ', err);
});
