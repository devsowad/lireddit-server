import { getModelForClass, pre, prop } from '@typegoose/typegoose';
import slugify from 'slugify';
import { Field, ObjectType } from 'type-graphql';
import { required } from '../validation/message';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { VoteModel } from './Vote';

@pre<Post>('findOneAndUpdate', function (this) {
  // @ts-ignore
  this._update.slug = slugify(this._update.slug);
})
@pre<Post>('save', function () {
  this.slug = slugify(this.slug);
})
@pre<Post>('deleteOne', async function () {
  // @ts-ignore
  await VoteModel.deleteMany({ postId: this._conditions._id });
})
@ObjectType()
export class Post extends BaseModel {
  @prop({ required: [true, required()], unique: true })
  @Field()
  title: string;

  @prop()
  @Field()
  slug: string;

  @prop({ required: [true, required()] })
  @Field()
  body: string;

  @prop({ required: true })
  @Field(() => User)
  author: string;
}

export const PostModel = getModelForClass(Post);
