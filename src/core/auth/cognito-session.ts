import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { CommonError } from '../../models/error';
import {
  AWS_ADD_USER_GROUP,
  AWS_ERROR_LOADING_POOL_USERS
} from '../../models/error-codes';
import { Result } from '../../models/result';
import { CognitoAuth } from './cognito';

export class CognitoSession extends CognitoAuth {
  static instance: CognitoSession;

  constructor() {
    super();
  }

  public static getInstance(): CognitoSession {
    if (!CognitoSession.instance) {
      CognitoSession.instance = new CognitoSession();
    }

    return CognitoSession.instance;
  }

  async getUsersInPool(): Promise<
    Result<CognitoIdentityServiceProvider.ListUsersResponse>
  > {
    return new Promise((resolve) => {
      const cognito = this.getCognitoSession();
      cognito.listUsers(
        { UserPoolId: this.poolData.UserPoolId },
        (err, data) => {
          if (err) {
            return resolve({
              error: new CommonError(AWS_ERROR_LOADING_POOL_USERS)
            });
          } else {
            return resolve({ result: data });
          }
        }
      );
    });
  }

  getCognitoUserSessionInfo(
    AccessToken: string
  ): Promise<CognitoIdentityServiceProvider.GetUserResponse | undefined> {
    return new Promise((resolve) => {
      const cic = this.getCognitoSession();
      cic.getUser({ AccessToken }, (err, data) => {
        if (err) {
          return resolve(undefined);
        } else {
          return resolve(data);
        }
      });
    });
  }

  async addUserToGroup(
    userName: string,
    group: string
  ): Promise<Result<boolean>> {
    return new Promise((resolve) => {
      const session = this.getCognitoSession();
      session.adminAddUserToGroup(
        {
          UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
          Username: userName,
          GroupName: group
        },
        (err) => {
          if (err) {
            return resolve({
              error: new CommonError(AWS_ADD_USER_GROUP, err.message)
            });
          }
          return resolve({ result: true });
        }
      );
    });
  }
}
