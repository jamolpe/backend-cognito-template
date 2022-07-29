import { CommonError } from '../../models/error';

export const manageResponseError = (
  commonError: CommonError
): { code: string; message: string } => {
  return {
    code: commonError.code,
    message: commonError.message
  };
};
