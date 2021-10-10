import { Mutation, Resolver, InputType, Arg, Field } from 'type-graphql';
import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server-errors';
import { User, UserModel } from '../model/User';

@InputType()
class RegisterInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(@Arg('input') input: RegisterInput): Promise<User> {
    const { username, password } = input;
    if (password.length < 9)
      throw new UserInputError('Password length must be greater than 8');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, password: hashedPassword });
    return user;
  }

  @Mutation(() => User)
  async login(@Arg('input') input: RegisterInput): Promise<User> {
    const { username, password } = input;
    const user = await UserModel.findOne({ username });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        return user;
      }
    }
    throw new UserInputError('Enter valid credentials');
  }
}
