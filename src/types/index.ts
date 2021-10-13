import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type ContextType = {
  req: Request & { session: { userId: string } };
  res: Response;
  redis: Redis;
};
