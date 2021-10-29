import { Field, InputType } from 'type-graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class UpdatePostInput {
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
  body: string;
  @Field(() => GraphQLUpload, { nullable: true })
  file: FileUpload;
}
