import DataLoader from 'dataloader';
import { Comment, CommentModel } from '../model/Comment';

export const createCommentLoader = () =>
  new DataLoader<string, Comment[]>(async (keys) => {
    const comments = await CommentModel.find({
      postId: { $in: keys as string[] },
    });
    const a: any = [];
    comments.forEach((c: any) => {
      if (a[c.postId]) {
        a[c.postId].push(c);
      } else {
        a[c.postId] = [c];
      }
    });
    return keys.map((key) => a[key]);
  });
