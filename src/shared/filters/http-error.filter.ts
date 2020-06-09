import { ExceptionFilter, Catch, HttpException, ArgumentsHost, Logger, HttpStatus } from "@nestjs/common";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const { path, method, url } = request;
    const { message } = exception;

    const errorResponse = {
      status,
      timestamp: new Date().toUTCString(),
      path,
      method,
      message
    };

    Logger.error(`(${method}) ${url}`, JSON.stringify(errorResponse), 'ExceptionFilter');

    response.status(status).json(errorResponse);
  }
}