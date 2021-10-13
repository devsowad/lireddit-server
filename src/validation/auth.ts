import { UserInputError } from 'apollo-server-errors';

export const validateEmail = (email: string) => {
  if (!matchEmail(email)) throw new UserInputError('Enter valid email');
};

export const matchEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password: string) => {
  if (password.length < 9)
    throw new UserInputError('Password length must be greater than 8');
};

export const validatePasswordAndConfirm = (
  password: string,
  confirmPassword: string
) => {
  if (password.length < 9)
    throw new UserInputError('Password length must be greater than 8');
  if (password !== confirmPassword)
    throw new UserInputError('Confirm password not matching');
};
