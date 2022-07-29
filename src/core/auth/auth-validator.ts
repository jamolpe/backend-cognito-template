import jwkToPem from 'jwk-to-pem';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../../helpers/logger';
import axios from 'axios';

export class AuthValidator {
  private static instance: AuthValidator;
  JWKS_URL: string;
  pems: any;
  ClientId: string;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this.JWKS_URL = `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
    if (process.env.LOCAL == 'PROD') this.generatePems();
    this.ClientId = process.env.AWS_COGNITO_CLIENT_ID;
  }

  public static getInstance(): AuthValidator {
    if (!AuthValidator.instance) {
      AuthValidator.instance = new AuthValidator();
    }

    return AuthValidator.instance;
  }
  public verifyToken(token: string): JwtPayload | undefined {
    const unverified = jwt.decode(token, { complete: true });
    if (!unverified) {
      logger.error(`[CognitoAuth - verifyToken] Error decoding token.`);
      return undefined;
    } else if (!unverified.header.kid || !this.pems[unverified.header.kid]) {
      logger.error('[CognitoAuth - verifyToken] Invalid JWT. KID not found.');
      return undefined;
    }
    try {
      let decoded_result = undefined;
      jwt.verify(
        token,
        this.pems[unverified.header.kid],
        {
          issuer: this.JWKS_URL.substring(
            0,
            this.JWKS_URL.indexOf('/.well-known/jwks.json')
          )
          //   maxAge: 60 * 60 //3600 seconds
        },
        (err, decoded: any) => {
          if (err) {
            throw err;
          }

          // Verify allowed token_use
          if (decoded.token_use !== 'access' && decoded.token_use !== 'id') {
            throw new Error(
              'token_use ${decoded.token_use} not "access" or "id".'
            );
          }

          // Verify aud or client_id
          const clientId = decoded.aud || decoded.client_id;
          if (clientId !== this.ClientId) {
            throw new Error(
              `Invalid JWT. Client id ${clientId} is not ${this.ClientId}.`
            );
          }
          decoded_result = decoded;
        }
      );
      return decoded_result;
    } catch (error) {
      logger.error(`[CognitoAuth - verifyToken] error verifying token`);
      return undefined;
    }
  }

  public verifyGroupRole(groups: string[], roles: string[]): boolean {
    return groups.some((group) => roles.includes(group));
  }

  private async generatePems() {
    try {
      const { data } = await axios.get(`${this.JWKS_URL}`);
      if (!data || !data.keys) {
        throw Error('Error downloading JWKs');
      }
      const pems = {};
      for (let i = 0; i < data.keys.length; i++) {
        pems[data.keys[i].kid] = jwkToPem(data.keys[i]);
      }
      this.pems = pems;
    } catch (error) {
      logger.error(
        `[CognitoAuth - generatePems] error generating pems ERROR: ${
          (error as Error).message
        } stack: ${(error as Error).stack}`
      );
    }
  }
}
