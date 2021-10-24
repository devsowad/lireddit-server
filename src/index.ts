import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import 'reflect-metadata';
import { COOKIE_NAME, CORS_ORIGIN, __prod__ } from './constants';
import { createPostLoader } from './dataloader/createPostLoader';
import { createUserLoader } from './dataloader/createUserLoader';
import { createVoteLoader } from './dataloader/createVoteLoader';
import { getSchema } from './graphql/schema';
import { ContextType } from './types';

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

const main = async () => {
  const app = express();

  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
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
    context: ({ req, res }): ContextType => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
      postLoader: createPostLoader(),
    }),
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  mongoose
    .connect(
      'mongodb://localhost:27017/lireddit?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
    )
    .then(() => {
      console.log('mongodb connected');
      if (!__prod__) mongoose.set('debug', true);
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
