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
import { CreatePostInput } from '../graphql/type/post/CreatePostInput';
import { Post, PostModel } from '../model/Post';
import { User } from '../model/User';
import { Vote, VoteModel } from '../model/Vote';
import { ContextType } from '../types';
import { existsThanReturn, validObjectId } from '../validation/input';

@ObjectType()
class PaginatedPost {
  @Field(() => [Post])
  posts: Post[];
  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(() => Post)
export class PostResolver {
  @Query(() => PaginatedPost)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string
  ): Promise<PaginatedPost> {
    const posts = await PostModel.find(
      cursor ? { createdAt: { $lt: cursor } } : {}
    )
      .limit(limit + 1)
      .sort({ createdAt: -1 });

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('slug') slug: string,
    @Arg('onEdit', () => Boolean, { nullable: true }) onEdit: boolean,
    @Ctx() { req }: ContextType
  ): Promise<Post> {
    const filter = onEdit ? { slug, author: req.session.userId } : { slug };

    const post = await PostModel.findOne(filter);
    return existsThanReturn(post, 'Post not found');
  }

  @Mutation(() => Post)
  @UseMiddleware(IsAuth)
  async createPost(
    @Arg('input') { title, body }: CreatePostInput,
    @Ctx() { req }: ContextType
  ): Promise<Post> {
    const post = new PostModel({
      title,
      body,
      author: req.session.userId,
      slug: title,
    });
    return await post.save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: string,
    @Arg('title') title: string,
    @Arg('body') body: string,
    @Ctx() { req }: ContextType
  ): Promise<Post> {
    validObjectId(id);
    const post = await PostModel.findOneAndUpdate(
      { _id: id, author: req.session.userId },
      { title, body, slug: title },
      { new: true, runValidators: true }
    );
    return existsThanReturn(post, 'Post not found');
  }

  @Mutation(() => Boolean)
  @UseMiddleware([IsAuth])
  async deletePost(
    @Arg('id') id: string,
    @Ctx() { req }: ContextType
  ): Promise<boolean> {
    validObjectId(id);
    await PostModel.deleteOne({
      _id: id,
      author: req.session.userId,
    });
    return true;
  }

  @FieldResolver()
  async author(
    @Root() { _doc: post }: { _doc: Post },
    @Ctx() { userLoader }: ContextType
  ): Promise<User> {
    const users = await userLoader.load(post.author);
    return users;
  }

  @FieldResolver(() => [Vote])
  async likes(@Root() { _doc: post }: { _doc: Post }): Promise<Vote[]> {
    return await VoteModel.find({ liked: true, postId: post._id });
  }

  @FieldResolver(() => [Vote])
  async deslikes(@Root() { _doc: post }: { _doc: Post }): Promise<Vote[]> {
    return await VoteModel.find({ liked: false, postId: post._id });
  }
}
