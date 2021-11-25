import { getModelForClass, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { required } from '../validation/message';
import { BaseModel } from './BaseModel';

@ObjectType()
export class Comment extends BaseModel {
  @prop({ required: [true, required()] })
  @Field()
  body: string;

  @prop()
  userId: string;

  @prop()
  postId: string;
}

export const CommentModel = getModelForClass(Comment);
