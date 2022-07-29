import { DateWorker } from '../helpers/date';
import logger from '../helpers/logger';
import { RequestUuid } from '../models/requester';

const postLoggerMiddleware = (req: RequestUuid, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    const now = new DateWorker();
    const diference = now.diff(req.start, 'milliseconds');
    logger.info(
      `request: ${req.uuid} ${req.method} ${
        req.path
      } and response: ${JSON.stringify(body)} on: ${diference} milliseconds`
    );

    // console.log(body);
    oldEnd.apply(res, restArgs);
  };

  next();
};

export default postLoggerMiddleware;
