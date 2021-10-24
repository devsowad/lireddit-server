import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createPostLoader } from '../dataloader/createPostLoader';
import { createUserLoader } from '../dataloader/createUserLoader';
import { createVoteLoader } from '../dataloader/createVoteLoader';

export type ContextType = {
  req: Request & { session: { userId: string } };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  voteLoader: ReturnType<typeof createVoteLoader>;
  postLoader: ReturnType<typeof createPostLoader>;
};
