import { UserResolver } from '../resolvers/user';
import { buildSchema } from 'type-graphql';
import { PostResolver } from '../resolvers/post';

export const getSchema = async () => {
  return await buildSchema({
    resolvers: [PostResolver, UserResolver],
    validate: false,
  });
};
