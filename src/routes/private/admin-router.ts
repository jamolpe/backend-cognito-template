import { Router } from 'express';
import { AdminController } from '../../controllers/private/admin-controller';
import { verifyUser } from '../../middlewares/auth-mw';
import { IRouter } from '../../models/router';

export class AdminRouter extends IRouter {
  adminController: AdminController;
  constructor() {
    super();
    this.adminController = new AdminController();
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get(
      '/users',
      (req, res, next) => verifyUser(req, res, next, ['admin']),
      (req, res) => this.adminController.listUsersInPool(req, res)
    );
  }
}
