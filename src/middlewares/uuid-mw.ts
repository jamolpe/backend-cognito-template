import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestUuid } from '../models/requester';

const requestUuid = (
  request: RequestUuid,
  _response: express.Response,
  next
) => {
  const uuid = uuidv4();
  request.uuid = uuid;
  next();
};

export default requestUuid;
