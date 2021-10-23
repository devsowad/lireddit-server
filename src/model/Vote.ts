import { getModelForClass, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { BaseModel } from './BaseModel';

@ObjectType()
export class Vote extends BaseModel {
  @prop({ default: false })
  @Field()
  liked: boolean;

  @prop({ required: true })
  postId: string;

  @prop({ required: true })
  userId: string;
}

export const VoteModel = getModelForClass(Vote);
