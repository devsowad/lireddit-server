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
import { User, UserModel } from '../model/User';
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
  async post(@Arg('id') id: string): Promise<Post> {
    validObjectId(id);
    const post = await PostModel.findById(id);
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
    });
    return await post.save();
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id') id: string,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Arg('body', () => String, { nullable: true }) body: string
  ): Promise<Post> {
    validObjectId(id);
    const post = await PostModel.findByIdAndUpdate(
      id,
      { title, body },
      { new: true, runValidators: true }
    );
    return existsThanReturn(post, 'Post not found');
  }

  @Mutation(() => Post)
  async deletePost(@Arg('id') id: string): Promise<Post> {
    validObjectId(id);
    const post = await PostModel.findByIdAndDelete(id);
    return existsThanReturn(post, 'Post not found');
  }

  @FieldResolver()
  async author(@Root() { _doc: post }: { _doc: Post }): Promise<User> {
    return (await UserModel.findById(post.author))!;
  }
}
