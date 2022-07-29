import { User } from '../user/model';

export interface UserForAdmin extends User {
  userStatus: string;
  userCreateDate: string;
}
