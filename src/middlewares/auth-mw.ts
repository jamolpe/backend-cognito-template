/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthValidator } from "../core/auth/auth-validator";
import logger from "../helpers/logger";
import { RequestUuid } from "../models/requester";
import { Response } from "express";
import { FORBIDDEN, UNAUTHORIZED } from "../models/constants";
import { JwtPayload } from "jsonwebtoken";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { AttributeListType } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { CognitoSession } from "../core/auth/cognito-session";

const authValidator = AuthValidator.getInstance();
const cognitoSession = CognitoSession.getInstance();

const verify_corresponding_tokens = (
  id_jwt_decoded: JwtPayload,
  access_jwt_decoded: JwtPayload
) => {
  if (
    access_jwt_decoded &&
    id_jwt_decoded &&
    id_jwt_decoded.aud === access_jwt_decoded.client_id
  ) {
    return true;
  } else {
    return false;
  }
};

const get_token_session_info = async (
  acess_token: string
): Promise<CognitoIdentityServiceProvider.GetUserResponse | undefined> => {
  return cognitoSession.getCognitoUserSessionInfo(acess_token);
};

const get_email_from_userinfo = (session_info: AttributeListType) => {
  return {
    email: session_info.find((s) => s.Name === "email").Value,
    cognitoId: session_info.find((s) => s.Name === "sub").Value,
  };
};

export const verifyUser = async (
  req: RequestUuid,
  res: Response,
  next,
  roles?: string[]
) => {
  try {
    if (process.env.ENV === "LOCAL") {
      req.user = { email: "user@test.com", cognitoId: "id1234" };
      return next();
    }
    const accessToken = req.cookies["accessToken"];
    const idToken = req.cookies["idToken"];
    if (!accessToken || !idToken) return res.status(401).send(UNAUTHORIZED);

    const id_jwt_decoded = authValidator.verifyToken(idToken);
    const access_jwt_decoded = authValidator.verifyToken(accessToken);
    const tokens_valid = verify_corresponding_tokens(
      id_jwt_decoded,
      access_jwt_decoded
    );
    const session_info = await get_token_session_info(accessToken);
    if (!tokens_valid || !session_info) {
      return res.status(401).send(UNAUTHORIZED);
    }
    if (roles) {
      const valid_role = authValidator.verifyGroupRole(
        access_jwt_decoded["cognito:groups"],
        roles
      );
      if (!valid_role) {
        return res.status(403).send(FORBIDDEN);
      }
    }
    req.user = get_email_from_userinfo(session_info.UserAttributes);
    req.accessToken = accessToken;
    next();
  } catch (error) {
    logger.error(
      `[verifyUser] error verifying token ERROR: ${(error as Error).message} `
    );
    return res.status(401).send(UNAUTHORIZED);
  }
};
