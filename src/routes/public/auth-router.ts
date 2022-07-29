import { Router } from 'express';
import { AuthController } from '../../controllers/public/auth-controller';
import { IRouter } from '../../models/router';

export class AuthRouter extends IRouter {
  authController: AuthController;
  constructor() {
    super();
    this.authController = new AuthController();
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post('/register', (req, res) =>
      this.authController.register(req, res)
    );
    this.router.post('/verify', (req, res) => {
      this.authController.verify(req, res);
    });
    this.router.post('/login', (req, res) => {
      this.authController.loginUser(req, res);
    });
    this.router.post('/forgot-password', (req, res) => {
      this.authController.forgotPassword(req, res);
    });
    this.router.post('/confirm-password', (req, res) => {
      this.authController.confirmPassword(req, res);
    });
  }
}
