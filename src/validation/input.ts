import { UserInputError } from 'apollo-server-errors';
import { isValidObjectId } from 'mongoose';

export const validObjectId = (id: string) => {
  const v = isValidObjectId(id);
  if (!v) throw new UserInputError('Post not found');
};

export const existsThanReturn = (value: any, message = 'not found') => {
  if (value) return value;
  else throw new UserInputError(message);
};
