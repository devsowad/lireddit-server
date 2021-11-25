import { UserResolver } from '../resolvers/user';
import { buildSchema } from 'type-graphql';
import { PostResolver } from '../resolvers/post';
import { VoteResolver } from '../resolvers/vote';
import { CommentResolver } from '../resolvers/comment';

export const getSchema = async () => {
  return await buildSchema({
    resolvers: [PostResolver, UserResolver, VoteResolver, CommentResolver],
    validate: false,
  });
};
