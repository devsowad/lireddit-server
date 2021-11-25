import { UserInputError } from 'apollo-server-errors';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { IsAuth } from '../graphql/middleware/isAuth';
import { CreateCommentInput } from '../graphql/type/comment/CreateCommentInput';
import { Comment, CommentModel } from '../model/Comment';
import { PostModel } from '../model/Post';
import { User } from '../model/User';
import { ContextType } from '../types';

@ObjectType()
class PaginatedComment {
  @Field(() => [Comment])
  comments: Comment[];
  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(() => Comment)
export class CommentResolver {
  @Query(() => PaginatedComment)
  async comments(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string,
    @Arg('postId') postId: string
  ): Promise<PaginatedComment> {
    const filter = { postId };
    const comments = await CommentModel.find(
      cursor ? { ...filter, createdAt: { $lt: cursor } } : filter
    )
      .limit(limit + 1)
      .sort({ createdAt: -1 });

    return {
      comments: comments.slice(0, limit),
      hasMore: comments.length === limit + 1,
    };
  }

  @Mutation(() => Comment)
  @UseMiddleware(IsAuth)
  async createComment(
    @Arg('input') { body, postId }: CreateCommentInput,
    @Ctx() { req }: ContextType
  ): Promise<Comment> {
    const post = await PostModel.findById(postId).count();
    if (post > 0) {
      return await CommentModel.create({
        body,
        postId,
        userId: req.session.userId,
      });
    } else {
      throw new UserInputError('Post not found');
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth)
  async deleteComment(
    @Arg('id') id: string,
    @Ctx() { req }: ContextType
  ): Promise<boolean> {
    await CommentModel.deleteOne({
      _id: id,
      userId: req.session.userId,
    });
    return true;
  }

  @FieldResolver(() => User)
  async user(
    @Root() { _doc: comment }: { _doc: Comment },
    @Ctx() { userLoader }: ContextType
  ): Promise<User> {
    return await userLoader.load(comment.userId);
  }
}
