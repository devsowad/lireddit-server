import { prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { BaseModel } from './BaseModel';

@ObjectType()
export class Post extends BaseModel {
  @prop()
  @Field()
  title: string;

  @prop()
  @Field()
  body: string;
}

export const PostModel = getModelForClass(Post);
