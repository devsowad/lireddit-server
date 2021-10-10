import { Request, Response } from 'express';

export type ContextType = {
  req: Request & { session: { userId: string } };
  res: Response;
};
