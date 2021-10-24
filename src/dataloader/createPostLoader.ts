import DataLoader from 'dataloader';
import { Post, PostModel } from '../model/Post';

export const createPostLoader = () =>
  new DataLoader<string, Post[]>(async (keys) => {
    const posts = await PostModel.find({ author: { $in: keys as string[] } });
    const a: any = [];
    posts.forEach((v: any) => {
      if (a[v.author]) {
        a[v.author].push(v);
      } else {
        a[v.author] = [v];
      }
    });
    return keys.map((key) => a[key]);
  });
