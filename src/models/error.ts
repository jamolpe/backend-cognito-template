import logger from '../helpers/logger';

export interface DetailedError {
  code: string;
  message?: string;
}

export interface MarkableError {
  isError?: boolean;
}

export class CommonError extends Error {
  code: string;
  message: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    logger.error(`[Error] code ${code} message: ${message ?? code}`);
  }
}
