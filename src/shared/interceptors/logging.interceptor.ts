import { NestInterceptor, Injectable, ExecutionContext, Logger, CallHandler} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  intercept(ctx: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();
  
    return next.handle().pipe(
      tap(() => {
        Logger.log(`${method} ${url} time: ${Date.now() - now}ms`, ctx.getClass().name, true)
      })
    );
  }
}