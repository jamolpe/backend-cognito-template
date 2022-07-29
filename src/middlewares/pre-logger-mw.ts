import { Response } from 'express';
import logger from '../helpers/logger';
import { RequestUuid } from '../models/requester';

const preLoggerMiddleware = (
  request: RequestUuid,
  _response: Response,
  next
) => {
  if (
    ['login', 'register', 'confirm-password', 'forgot-password', 'auth'].some(
      (path) => request.url.includes(path)
    )
  ) {
    logger.info(
      `request: ${request.uuid} ${request.method} ${request.path} body: secured`
    );
  } else {
    logger.info(
      `request: ${request.uuid} ${request.method} ${
        request.path
      } body: ${JSON.stringify(request.body)}`
    );
  }

  next();
};

export default preLoggerMiddleware;
