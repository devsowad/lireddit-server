import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { IsAuth } from '../graphql/middleware/isAuth';
import { User } from '../model/User';
import { Vote, VoteModel } from '../model/Vote';
import { ContextType } from '../types';

@Resolver(() => Vote)
export class VoteResolver {
  @Mutation(() => [Vote])
  @UseMiddleware(IsAuth)
  async vote(
    @Arg('postId') postId: string,
    @Arg('liked') liked: boolean,
    @Ctx() { req }: ContextType
  ): Promise<Vote[]> {
    const { userId } = req.session;

    const vote = await VoteModel.findOne({ postId, userId });
    if (vote) {
      if (vote.liked === liked) {
        await vote.delete();
      } else {
        await vote.updateOne({ liked });
      }
    } else {
      await VoteModel.create({
        postId,
        userId,
        liked,
      });
    }

    return await VoteModel.find({ postId: postId });
  }

  @FieldResolver(() => User)
  async user(
    @Root() { _doc: vote }: { _doc: Vote },
    @Ctx() { userLoader }: ContextType
  ): Promise<User> {
    return await userLoader.load(vote.userId);
  }
}
