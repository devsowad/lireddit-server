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
import { CreatePostInput } from '../graphql/type/post/CreatePostInput';
import { Post, PostModel } from '../model/Post';
import { User } from '../model/User';
import { Vote } from '../model/Vote';
import { ContextType } from '../types';
import { uploadFile } from '../utils/uploadFile';
import { existsThanReturn, validObjectId } from '../validation/input';
import cloudinary from 'cloudinary';
import { FileUpload } from 'graphql-upload';
import { UpdatePostInput } from '../graphql/type/post/updatePostInput';
import { Comment, CommentModel } from '../model/Comment';

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
    @Arg('input') { title, body, file }: CreatePostInput,
    @Ctx() { req }: ContextType
  ): Promise<Post> {
    try {
      const post = new PostModel({
        title,
        body,
        author: req.session.userId,
        slug: title,
      });
      const image = await uploadImage(file);
      post.imageUrl = image.secure_url;
      post.imagePublicId = image.public_id;

      return await post.save();
    } catch (error) {
      throw new UserInputError(error.message);
    }
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('input') { id, title, body, file }: UpdatePostInput,
    @Ctx() { req }: ContextType
  ): Promise<Post> {
    validObjectId(id);
    let post = await PostModel.findOneAndUpdate(
      { _id: id, author: req.session.userId },
      {
        title,
        body,
        slug: title,
      },
      { new: true, runValidators: true }
    );
    if (post && file) {
      const image = await uploadImage(file);
      await deleteImage(post?.imagePublicId);
      post = await PostModel.findOneAndUpdate(
        { _id: id, author: req.session.userId },
        { imageUrl: image?.secure_url, imagePublicId: image?.public_id },
        { new: true }
      );
    }
    return existsThanReturn(post, 'Post not found');
  }

  @Mutation(() => Boolean)
  @UseMiddleware([IsAuth])
  async deletePost(
    @Arg('id') id: string,
    @Ctx() { req }: ContextType
  ): Promise<boolean> {
    validObjectId(id);
    const post = await PostModel.findOneAndDelete({
      _id: id,
      author: req.session.userId,
    });
    await deleteImage(post?.imagePublicId);
    return true;
  }

  @FieldResolver()
  async author(
    @Root() { _doc: post }: { _doc: Post },
    @Ctx() { userLoader }: ContextType
  ): Promise<User> {
    return await userLoader.load(post.author);
  }

  @FieldResolver(() => [Vote], { nullable: true })
  async votes(
    @Root() { _doc: post }: { _doc: Post },
    @Ctx() { voteLoader }: ContextType
  ): Promise<Vote[]> {
    return await voteLoader.load(post._id);
  }

  @FieldResolver(() => [Comment], { nullable: true })
  async comments(
    @Root() { _doc: post }: { _doc: Post },
    @Ctx() { commentLoader }: ContextType
  ): Promise<Comment[]> {
    return await commentLoader.load(post._id);
  }

  @FieldResolver(() => Int)
  async commentsCount(@Root() { _doc: post }: { _doc: Post }) {
    return await CommentModel.find({ postId: post._id }).count();
  }
}

const deleteImage = async (publicId?: string) => {
  if (publicId) {
    await cloudinary.v2.uploader.destroy(publicId);
  }
};

const uploadImage = async (file: FileUpload) => {
  return await await uploadFile(file, {
    allowed_formats: ['jpeg', 'png'],
    folder: 'poster',
    unique_filename: true,
  });
};
