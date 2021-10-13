import { getModelForClass, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { required } from '../validation/message';
import { BaseModel } from './BaseModel';
import { User } from './User';

@ObjectType()
export class Post extends BaseModel {
  @prop({ required: [true, required()], unique: true })
  @Field()
  title: string;

  @prop({ required: [true, required()] })
  @Field()
  body: string;

  @prop({ required: true })
  @Field(() => User)
  author: string;
}

export const PostModel = getModelForClass(Post);
