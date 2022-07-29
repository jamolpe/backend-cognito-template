import dotenv from "dotenv";
import * as pack from "../package.json";
dotenv.config();
import cors from "cors";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import preLoggerMiddleware from "./middlewares/pre-logger-mw";
import requestUuid from "./middlewares/uuid-mw";
import { AuthRouter } from "./routes/public/auth-router";
import errorMiddleware from "./middlewares/error-mw";
import logger from "./helpers/logger";
import timerMiddleware from "./middlewares/timer-mw";
import postLoggerMiddleware from "./middlewares/post-logger-mw";
import { Router } from "express";
import { UserRouter } from "./routes/private/user-router";
import cookieParser from "cookie-parser";
import { Database } from "./services/database/database";
import { AdminRouter } from "./routes/private/admin-router";

export class Server {
  public app: express.Application;
  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  public start(): void {
    this.postConfig(); // this MUST be here as is a post validator request
    this.app.listen(process.env.PORT, () => {
      logger.info(`Server started at PORT ${process.env.PORT}`);
    });
  }

  private config() {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(requestUuid);
    this.app.use(timerMiddleware);
    this.app.use(preLoggerMiddleware);
    this.app.use(postLoggerMiddleware);
    new Database().connect();
    this.configureSwagger();
  }

  private configureSwagger() {
    const swaggerDefinition = {
      openapi: "3.0.0",
      info: {
        title: "Express API for agoradoc",
        version: pack.version,
      },
    };
    const options = {
      swaggerDefinition,
      // Paths to files containing OpenAPI definitions
      apis: ["**/*.ts"],
    };
    const swaggerSpec = swaggerJSDoc(options);
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private postConfig() {
    this.app.use(errorMiddleware);
  }
  private routes(): void {
    const router = Router();
    this.definePrivateRoutes(router);
    this.definePublicRoutes(router);
  }

  private definePrivateRoutes(router: Router): void {
    router.use("/user", new UserRouter().router);
    router.use("/admin", new AdminRouter().router);
  }

  private definePublicRoutes(router: Router): void {
    router.use("/auth", new AuthRouter().router);
  }
}

const server = new Server();
server.start();
