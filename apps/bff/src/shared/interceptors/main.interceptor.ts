import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { concat, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class MainInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MainInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const isSse = this.reflector.get<boolean>(
      '__sse__' /* https://github.com/nestjs/nest/blob/0dc4f919f153a64863daf2f490b9c0bb80849bb6/packages/common/constants.ts#L30 */,
      ctx.getHandler(),
    );

    if (isSse) {
      return concat(next.handle(), of('__END_OF_EVENT_STREAM__'))
        .pipe(map((data: any) => ({ data: { data } })))
        .pipe(
          catchError((error) => {
            if (error instanceof HttpException) {
              error = error.getResponse();
            } else if (error instanceof Error) {
              error = { message: error.message };
            }

            return of({ data: { error } });
          }),
        );
    }

    return next.handle().pipe(map((data) => ({ data })));
  }
}
