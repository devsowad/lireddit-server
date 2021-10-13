import { UserInputError } from 'apollo-server-errors';
import { MiddlewareFn } from 'type-graphql';
import { ContextType } from '../../types';

export const IsAuth: MiddlewareFn<ContextType> = async ({ context }, next) => {
  try {
    if (!context.req.session.userId) {
      throw new UserInputError('Unauthorized');
    }
    return await next();
  } catch (error) {
    console.log('middleware error: ', error);
  }
};
