import { plugin, pre, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import uniqueValidator from 'mongoose-unique-validator';

@pre<BaseModel>('findOneAndUpdate', function (this) {
  // @ts-ignore
  this._update.updatedAt = new Date().toISOString();
})
@pre<BaseModel>('save', function () {
  this.createdAt = new Date().toISOString();
  this.updatedAt = new Date().toISOString();
})
@plugin(uniqueValidator)
@ObjectType()
export class BaseModel {
  readonly _id: string;

  @Field()
  readonly id: string;

  @prop()
  @Field()
  public createdAt: string;

  @prop()
  @Field()
  public updatedAt: string;
}
