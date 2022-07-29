import { Router } from 'express';
import { UserController } from '../../controllers/private/user-controller';
import { verifyUser } from '../../middlewares/auth-mw';
import { IRouter } from '../../models/router';

export class UserRouter extends IRouter {
  private authController: UserController;
  constructor() {
    super();
    this.authController = new UserController();
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get(
      '/info',
      (req, res, next) => verifyUser(req, res, next, ['freemium']),
      (req, res) => this.authController.getUserInformation(req, res)
    );
    this.router.post(
      '/change-password',
      (req, res, next) => verifyUser(req, res, next, ['freemium']),
      (req, res) => this.authController.modifyPassword(req, res)
    );
  }
}
