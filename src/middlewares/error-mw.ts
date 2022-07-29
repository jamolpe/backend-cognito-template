const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  return res.status(500).send('INTERNAL_SERVER_ERROR');
};

export default errorMiddleware;
