import { Post, PostModel } from '../model/Post';
import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { validObjectId, existsThanReturn } from '../validation/input';
import { CreatePostInput } from '../graphql/type/post/CreatePostInput';
import { User, UserModel } from '../model/User';

@Resolver(() => Post)
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await PostModel.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id') id: string): Promise<Post> {
    validObjectId(id);
    const post = await PostModel.findById(id);
    return existsThanReturn(post, 'Post not found');
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('input') { title, body }: CreatePostInput
  ): Promise<Post> {
    const post = new PostModel({
      title,
      body,
      author: '6166bba06cdd491d06abd4ad',
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
