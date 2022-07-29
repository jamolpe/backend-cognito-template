import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { DateWorker } from '../../helpers/date';
import { Result } from '../../models/result';
import { CognitoSession } from '../auth/cognito-session';
import { User } from '../user/model';
import { UserForAdmin } from './model';

export class UserManagerCore {
  private cognito: CognitoSession;
  constructor() {
    this.cognito = CognitoSession.getInstance();
  }

  private async transformCognitoToUser(
    cognitoUser: CognitoIdentityServiceProvider.ListUsersResponse
  ): Promise<UserForAdmin[]> {
    const promises = cognitoUser.Users.map(async (user) => {
      const { Attributes, UserStatus, UserCreateDate } = user;
      const email = Attributes.find((s) => s.Name === 'email').Value;
      const cognitoId = Attributes.find((s) => s.Name === 'sub').Value;
      const emailVerified =
        Attributes.find((s) => s.Name === 'email_verified').Value === 'true';
      return {
        email,
        cognitoId,
        emailVerified,
        userStatus: UserStatus,
        userCreateDate: new DateWorker(UserCreateDate).format(
          'YYYY-MM-DDTHH:mm:ss'
        )
      };
    });
    return Promise.all(promises);
  }
  async listAllUsers(): Promise<Result<User[]>> {
    const { result, error } = await this.cognito.getUsersInPool();
    if (error) {
      return { error };
    }
    if (!result) {
      return { result: [] };
    }
    return { result: await this.transformCognitoToUser(result) };
  }
}
