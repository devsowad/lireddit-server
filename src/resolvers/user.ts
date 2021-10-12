import {
  Mutation,
  Resolver,
  InputType,
  Arg,
  Field,
  Ctx,
  Query,
} from 'type-graphql';
import bcrypt from 'bcrypt';
import { User, UserModel } from '../model/User';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { ContextType } from '../types';
import { COOKIE_NAME } from '../constants';

@InputType()
class RegisterInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me(@Ctx() { req }: ContextType) {
    const userId = req.session.userId;
    if (userId) {
      const user = UserModel.findById(userId);
      if (user) return user;
    }
    throw new AuthenticationError('Unauthorized');
  }

  @Mutation(() => User)
  async register(
    @Arg('input') input: RegisterInput,
    @Ctx() { req }: ContextType
  ): Promise<User> {
    const { username, password } = input;
    if (password.length < 9)
      throw new UserInputError('Password length must be greater than 8');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, password: hashedPassword });
    req.session.userId = user.id;
    return user;
  }

  @Mutation(() => User)
  async login(
    @Arg('input') input: RegisterInput,
    @Ctx() { req }: ContextType
  ): Promise<User> {
    const { username, password } = input;
    const user = await UserModel.findOne({ username });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        req.session.userId = user.id;
        return user;
      }
    }
    throw new UserInputError('Enter valid credentials');
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: ContextType) {
    req.session.destroy((err) => {
      if (err) console.log(err);
      return false;
    });
    res.clearCookie(COOKIE_NAME);
    return true;
  }
}
