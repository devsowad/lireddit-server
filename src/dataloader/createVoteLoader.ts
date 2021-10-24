import DataLoader from 'dataloader';
import { Vote, VoteModel } from '../model/Vote';

export const createVoteLoader = () =>
  new DataLoader<string, Vote[]>(async (keys) => {
    const votes = await VoteModel.find({ postId: { $in: keys as string[] } });
    const a: any = [];
    votes.forEach((v: any) => {
      if (a[v.postId]) {
        a[v.postId].push(v);
      } else {
        a[v.postId] = [v];
      }
    });
    return keys.map((key) => a[key]);
  });
