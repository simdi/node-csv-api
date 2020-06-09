# Node CSV App.
The Node CSV App is a full-stack javascript application built with Nestjs and MongoDB.

## Prerequisites
* node >= 9.X
  * All OSes: [click here for installation instructions](https://nodejs.org/en/download/)
* MongoDB >= 3.X
  * All OSes: [click here for installation instructions](https://www.mongodb.com/download-center/community)


## Basic Build Instructions

A quick guide to basic setup of the **Node CSV App** project on your local machine


### Clone
```sh
$ git clone https://github.com/simdi/node-csv-api.git
```

### Setup .env file
```sh
$ cd node-csv-api
$ touch .env
$ echo PORT=9000 >> .env
$ echo MONGO_DB=node-csv >> .env
$ echo MONGO_PORT=27017 >> .env
$ echo MONGO_HOST=localhost >> .env
```

### Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## API Documentation
The api documentation can be found on this url: [API](http://localhost:9000/api/v1/docs)

## Thanks
If you have successfully completed the above setup, then you are good to go.
