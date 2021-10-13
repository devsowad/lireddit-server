import { plugin, pre, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import uniqueValidator from 'mongoose-unique-validator';

@pre<BaseModel>('findOneAndUpdate', function (this) {
  // @ts-ignore
  this._update.updatedAt = new Date().toISOString();
})
@plugin(uniqueValidator)
@ObjectType()
export class BaseModel {
  readonly _id: string;

  @Field()
  readonly id: string;

  @prop({ default: new Date().toISOString() })
  @Field()
  readonly createdAt: string;

  @prop({ default: new Date().toISOString() })
  @Field()
  public updatedAt: string;
}
