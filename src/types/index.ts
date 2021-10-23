import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createUserLoader } from '../dataloader/createUserLoader';

export type ContextType = {
  req: Request & { session: { userId: string } };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
