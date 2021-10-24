import DataLoader from 'dataloader';
import { UserModel, User } from '../model/User';

export const createUserLoader = () =>
  new DataLoader<string, User>(async (userIds) => {
    const users = await UserModel.find({ _id: { $in: userIds as string[] } });
    const userMap: { [key: string]: User } = {};
    users.forEach((u) => {
      userMap[u.id] = u;
    });
    return userIds.map((id) => userMap[id]);
  });
