import * as fs from 'fs';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

enum LogLevel {
  ERROR, WARN, INFO, DEBUG
}

@Injectable()
export class HelperService {
  static LOG_LEVEL = LogLevel;

  async catchValidationError(error: any): Promise<never> {
    if (error.name === 'MongoError') {
      const errMsg = await this.getMsgFromMongoError(error.errmsg);
      throw new HttpException(errMsg, HttpStatus.BAD_REQUEST);
    } else if (error.name === 'ValidationError') {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } 
    // else if (error.name === 'Error') {
    //   throw new HttpException(error.message, error.status);
    // } else if (error.name === 'CastError') {
    //   throw new HttpException(error.message, status);
    // }

    throw new HttpException(error, error.status);
  }

  async getMsgFromMongoError(error: string): Promise<string> {
    if (error.length > 0) {
      const errMsg = error.split(':').slice(2).join('').trim();
      return errMsg;
    }
    return error; 
  }
}
