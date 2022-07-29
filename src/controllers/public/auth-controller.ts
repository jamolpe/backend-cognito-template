/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { Response } from "express";
import { CognitoAuth } from "../../core/auth/cognito";
import { CognitoSession } from "../../core/auth/cognito-session";
import logger from "../../helpers/logger";
import { INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED } from "../../models/constants";
import { RequestUuid } from "../../models/requester";

export class AuthController {
  cognito: CognitoAuth;
  cognitoSession: CognitoSession;
  constructor() {
    this.cognito = CognitoAuth.getInstance();
    this.cognitoSession = CognitoSession.getInstance();
  }

  public register(req: RequestUuid, res: Response) {
    const { email, password } = req.body;
    if (process.env.ENV !== "LOCAL") {
      try {
        this.cognito.initAWS();
        this.cognito
          .getUserPool()
          .signUp(
            email,
            password,
            this.cognito.setCognitoAttributeList(email),
            null,
            async (err, result) => {
              if (err) {
                return res.status(400).send(err.message);
              }
              const userName = result.user.getUsername();

              const response = {
                username: userName,
                userConfirmed: result.userConfirmed,
              };
              return res.status(200).send(response);
            }
          );
      } catch (error) {
        logger.error(`[register] error: ${(error as Error).message}`);
        return res.status(500).send(INTERNAL_SERVER_ERROR);
      }
    }
    return res.status(422).send(NOT_IMPLEMENTED);
  }

  public verify(req: RequestUuid, res: Response) {
    const { code, email } = req.body;
    try {
      this.cognito
        .getCognitoUser(email)
        .confirmRegistration(code, true, (err, result) => {
          if (err) {
            return res.status(400).send(err);
          }
          return res.status(200).send(result);
        });
    } catch (error) {
      logger.error(`[confirmUser] error: ${(error as Error).message}`);
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }

  private loginWithLogout(
    cognitoUser: CognitoUser,
    authDetails: AuthenticationDetails,
    disconnectOthers: boolean,
    res: Response
  ) {
    return cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        if (disconnectOthers) {
          return cognitoUser.globalSignOut({
            onSuccess: () => {
              return this.loginWithLogout(cognitoUser, authDetails, false, res);
            },
            onFailure: () => {
              logger.error(`[loginWithLogout] global log out did not work`);
            },
          });
        }
        const token = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };
        const decodedIdCode = this.cognito.decodeJWTIdToken(token.idToken);

        res.cookie("idToken", token.idToken, {
          expires: new Date(result.getIdToken().getExpiration() * 1000),
        });
        res.cookie("accessToken", token.accessToken, {
          expires: new Date(result.getAccessToken().getExpiration() * 1000),
        });
        const refreshData = new Date();
        refreshData.setDate(refreshData.getDate() + 30);
        res.cookie("refreshToken", token.refreshToken, {
          expires: refreshData,
        });
        return res.status(200).send(decodedIdCode);
      },
      onFailure: (err) => {
        return res.status(400).send(err.message);
      },
    });
  }
  public loginUser(req: RequestUuid, res: Response) {
    const { password, email } = req.body;
    try {
      if (process.env.ENV !== "LOCAL") {
        const cognitoUser = this.cognito.getCognitoUser(email);
        const authDetails = this.cognito.getAuthDetails(email, password);
        return this.loginWithLogout(cognitoUser, authDetails, true, res);
      } else {
        res.cookie("idToken", "idToken_fakecookie", {
          expires: new Date(new Date().getTime() + 60 * 60 * 1000),
        });
        res.cookie("accessToken", "accessToken_fakecookie", {
          expires: new Date(new Date().getTime() + 60 * 60 * 1000),
        });
        const refreshData = new Date();
        refreshData.setDate(refreshData.getDate() + 30);
        res.cookie("refreshToken", "refreshToken_fakecookie", {
          expires: refreshData,
        });
        return res.status(200).send("IdCode");
      }
    } catch (error) {
      logger.error(`[loginUser] error: ${(error as Error).message}`);
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }

  public forgotPassword(req: RequestUuid, res: Response) {
    const { email } = req.body;

    try {
      this.cognito.getCognitoUser(email).forgotPassword({
        onSuccess: () => {
          return res.status(204).send();
        },
        onFailure: (err) => {
          return res.status(400).send(err);
        },
      });
    } catch (error) {
      logger.error(`[forgotPassword] error: ${(error as Error).message}`);
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }

  public confirmPassword(req: RequestUuid, res: Response) {
    const { email, verificationCode, newPassword } = req.body;

    try {
      this.cognito
        .getCognitoUser(email)
        .confirmPassword(verificationCode, newPassword, {
          onSuccess: () => {
            return res.status(204).send();
          },
          onFailure: (err) => {
            return res.status(400).send(err);
          },
        });
    } catch (error) {
      logger.error(`[confirmPassword] error: ${(error as Error).message}`);
      return res.status(500).send(INTERNAL_SERVER_ERROR);
    }
  }
}
