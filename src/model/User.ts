import { prop, getModelForClass } from '@typegoose/typegoose';
import { required } from '../validation/message';
import { Field, ObjectType } from 'type-graphql';
import { BaseModel } from './BaseModel';
import { Post } from './Post';

@ObjectType()
export class User extends BaseModel {
  @prop({ required: [true, required()], unique: true })
  @Field()
  username: string;

  @prop({ required: [true, required()], unique: true })
  @Field()
  email: string;

  @prop({ required: [true, required()] })
  readonly password: string;

  @Field(() => [Post], { nullable: true })
  posts: Post[];
}

export const UserModel = getModelForClass(User);
