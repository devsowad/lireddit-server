import DataLoader from 'dataloader';
import { UserModel, User } from '../model/User';

export const createUserLoader = () =>
  new DataLoader<string, User>(async (userIds) => {
    const users = await UserModel.find({ _id: { $in: userIds as string[] } });
    const userIdToUser: any = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    console.log('userIds', userIds);
    console.log('map', userIdToUser);
    console.log('sortedUsers', sortedUsers);
    return sortedUsers;
  });
