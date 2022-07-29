import { DateWorker } from '../helpers/date';

const timerMiddleware = (req, _res, next) => {
  const now = new DateWorker();
  req.start = now;
  next();
};

export default timerMiddleware;
