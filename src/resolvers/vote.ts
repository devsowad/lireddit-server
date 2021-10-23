import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { IsAuth } from '../graphql/middleware/isAuth';
import { User, UserModel } from '../model/User';
import { Vote, VoteModel } from '../model/Vote';
import { ContextType } from '../types';

@ObjectType()
class Votes {
  @Field(() => [Vote])
  likes: Vote[];

  @Field(() => [Vote])
  deslikes: Vote[];
}

@Resolver(() => Vote)
export class VoteResolver {
  @Mutation(() => Votes)
  @UseMiddleware(IsAuth)
  async vote(
    @Arg('postId') postId: string,
    @Arg('liked') liked: boolean,
    @Ctx() { req }: ContextType
  ): Promise<Votes> {
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

    const votes = await VoteModel.find({ postId: postId });
    return {
      likes: votes.filter((v) => v.liked === true),
      deslikes: votes.filter((v) => v.liked === false),
    };
  }

  @FieldResolver(() => User)
  async author(@Root() { _doc: vote }: { _doc: Vote }): Promise<User> {
    return (await UserModel.findById(vote.userId))!;
  }
}
