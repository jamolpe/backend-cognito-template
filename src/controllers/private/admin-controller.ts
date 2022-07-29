import { Response } from 'express';
import { UserManagerCore } from '../../core/admin/usermanager-core';
import logger from '../../helpers/logger';
import { INTERNAL_SERVER_ERROR } from '../../models/constants';
import { RequestUuid } from '../../models/requester';

export class AdminController {
  private userManagerCore: UserManagerCore;
  constructor() {
    this.userManagerCore = new UserManagerCore();
  }

  async listUsersInPool(req: RequestUuid, res: Response) {
    try {
      const { result, error } = await this.userManagerCore.listAllUsers();
      if (result) {
        return res.status(200).send(result);
      }
      if (error) {
        return res.status(503).send();
      }
    } catch (error) {
      logger.error(
        `request: ${req.uuid} [AdminController - listUsersInPool] error: ${
          (error as Error).message
        }`
      );
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }
}
