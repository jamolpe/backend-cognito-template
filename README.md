# backend-cognito-template

Template to work with cognito auth users
## Stack

- [Typescript 4.5.2](https://www.typescriptlang.org/)
- [Node 16.13.1](https://nodejs.org/es/)
- [Express](https://expressjs.com/es/)
- [dayjs](https://github.com/iamkun/dayjs)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [uuid](https://github.com/uuidjs/uuid)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [aws-sdk](https://aws.amazon.com/es/sdk-for-javascript)

## Usage

In order to have this project running you need a .env file (or environment variables in current instance) with cognito configuration. Local env can run with a "static" user auth that does not consume cognito

## Folders

- Config -> configuration files
- Controllers -> application rest functions
- Core -> application core logic
- Helpers -> common application helpers
- Middlewares -> application middlewares
- Models -> application common models
- Routes -> public and private routes definition
- Services -> external data providers (databases or external apis)
- server.ts -> entry point
## To contribute

This project uses commitlint and husky to maintain best practices in commits, we use the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/)

eslint is configured to maintain best practices in code and prettier to have the same structure
