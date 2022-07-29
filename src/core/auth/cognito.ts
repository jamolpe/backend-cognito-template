import AWS, { CognitoIdentityServiceProvider } from "aws-sdk";
import {
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import jwt_decode from "jwt-decode";

export class CognitoAuth {
  poolData: { UserPoolId: string; ClientId: string };
  cognitoAttributeList: any[];
  static instance: CognitoAuth;
  constructor() {
    this.cognitoAttributeList = [];
    this.poolData = {
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
    };
  }

  public static getInstance(): CognitoAuth {
    if (!CognitoAuth.instance) {
      CognitoAuth.instance = new CognitoAuth();
    }
    return CognitoAuth.instance;
  }

  attributes(key, value) {
    return {
      Name: key,
      Value: value,
    };
  }

  setCognitoAttributeList(email: string) {
    const atributte = new CognitoUserAttribute(this.attributes("email", email));
    return [atributte];
  }
  getCognitoAttributeList() {
    return this.cognitoAttributeList;
  }

  getUserPool() {
    return new CognitoUserPool(this.poolData);
  }

  getCognitoUser(email) {
    const userData = {
      Username: email,
      Pool: this.getUserPool(),
    };
    return new CognitoUser(userData);
  }

  getCognitoSession(): AWS.CognitoIdentityServiceProvider {
    this.initAWS();
    return new AWS.CognitoIdentityServiceProvider();
  }

  getAuthDetails(email, password) {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    return new AuthenticationDetails(authenticationData);
  }

  initAWS() {
    AWS.config.region = process.env.AWS_COGNITO_REGION; // Region
    AWS.config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  decodeJWTIdToken(idToken: string) {
    const decoded: any = jwt_decode(idToken);
    const { email, exp } = decoded;
    return { email, exp };
  }
  decodeJWTAcessToken(accessToken: string) {
    const decoded: any = jwt_decode(accessToken);
    const { email, exp } = decoded;
    return { email, exp };
  }
}
