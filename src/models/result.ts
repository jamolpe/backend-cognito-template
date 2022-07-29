import { CommonError } from './error';

export interface Result<T> {
  result?: T;
  error?: CommonError;
}
