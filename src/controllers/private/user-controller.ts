import { RequestUuid } from '../../models/requester';
import { Response } from 'express';
import { CognitoAuth } from '../../core/auth/cognito';
import logger from '../../helpers/logger';
import { INTERNAL_SERVER_ERROR } from '../../models/constants';

export class UserController {
  private cognito: CognitoAuth;
  constructor() {
    this.cognito = CognitoAuth.getInstance();
  }
  async getUserInformation(req: RequestUuid, res: Response) {
    const { user } = req;
    return res.status(200).send(user);
  }
  async modifyPassword(req: RequestUuid, res: Response) {
    const { newPassword, oldPassword } = req.body;
    try {
      this.cognito.getCognitoSession().changePassword(
        {
          AccessToken: req.accessToken,
          PreviousPassword: oldPassword,
          ProposedPassword: newPassword
        },
        (err, data) => {
          if (err) {
            return res.status(400).send(err);
          }
          logger.info(JSON.stringify(data));
          return res.status(204).send();
        }
      );
    } catch (error) {
      logger.error(
        `request: ${req.uuid} [UserController - modifyPassword] error: ${
          (error as Error).message
        }`
      );
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }
}
