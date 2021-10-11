import 'reflect-metadata';
import mongoose from 'mongoose';
import { getSchema } from './graphql/schema';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { __prod__ } from './constants';
import { ContextType } from './types';
import cors from 'cors';

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

const main = async () => {
  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.SECURE_COOKIE ? true : false || __prod__,
      },
      saveUninitialized: false,
      secret: 'keyboard cat',
      resave: false,
    })
  );

  const schema = await getSchema();
  const server = new ApolloServer({
    schema,
    context: ({ req, res }): ContextType => ({ req, res }),
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

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
