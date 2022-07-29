import { Router } from 'express';

export abstract class IRouter {
  router: Router;

  abstract routes();
}
