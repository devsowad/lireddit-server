import { __prod__ } from '../constants';

export const required = () => `can't be empty`;

export const minlength = (length: number) => `min length should be ${length}`;

export const formatError = (err: any) =>
  __prod__
    ? { message: err.message, extensions: { code: err.extensions?.code } }
    : err;
