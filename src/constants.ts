export const __prod__ = process.env.NODE_ENV === 'production';

export const COOKIE_NAME = 'qid';

export const FORGOT_PASSWORD_PREFIX = 'forget-password:';

export const CORS_ORIGIN = process.env.CLIENT_URL || [
  'https://studio.apollographql.com',
  'http://localhost:3000',
];
