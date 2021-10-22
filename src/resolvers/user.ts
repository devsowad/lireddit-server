import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import bcrypt from 'bcrypt';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { v4 as uuid } from 'uuid';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { ChangePasswordInput } from '../graphql/type/user/ChangePasswordInput';
import { LoginInput } from '../graphql/type/user/LoginInput';
import { RegisterInput } from '../graphql/type/user/RegisterInput';
import { sendMail } from '../mail/send';
import { Post, PostModel } from '../model/Post';
import { User, UserModel } from '../model/User';
import { ContextType } from '../types';
import {
  validateEmail,
  validatePassword,
  validatePasswordAndConfirm,
} from '../validation/auth';

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

@Resolver(() => User)
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
    @Arg('input') { username, password, email }: RegisterInput,
    @Ctx() { req }: ContextType
  ): Promise<User> {
    validatePassword(password);
    validateEmail(email);

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });
    req.session.userId = user.id;
    return user;
  }

  @Mutation(() => User)
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() { req }: ContextType
  ): Promise<User> {
    const { usernameOrEmail, password } = input;
    let user = await UserModel.findOne({ email: usernameOrEmail });
    if (!user) user = await UserModel.findOne({ username: usernameOrEmail });
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

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: ContextType
  ): Promise<boolean> {
    validateEmail(email);
    const user = await UserModel.findOne({ email });
    if (!user) return true;

    const token = uuid();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      60 * 60 * 60 * 24 * 3 // 3 days
    );

    const text = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;
    await sendMail(email, text);
    return true;
  }

  @Mutation(() => User)
  async changePassword(
    @Arg('input') { newPassword, confirmPassword, token }: ChangePasswordInput,
    @Ctx() { redis, req }: ContextType
  ): Promise<User> {
    validatePasswordAndConfirm(newPassword, confirmPassword);
    const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
    if (userId) {
      const hashedPassword = await hashPassword(newPassword);
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
      if (user) {
        await redis.del(FORGOT_PASSWORD_PREFIX + token);
        req.session.userId = user.id;
        return user;
      }
    }
    throw new UserInputError('Invalid token');
  }

  @FieldResolver()
  async posts(@Root() { _doc: user }: { _doc: User }): Promise<[Post] | any> {
    return await PostModel.find({ author: user._id });
  }

  @FieldResolver()
  email(
    @Root() { _doc: user }: { _doc: User },
    @Ctx() { req }: ContextType
  ): string {
    if (user._id.toString() === req.session.userId) {
      return user.email;
    }
    return '';
  }
}
