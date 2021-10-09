import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { TAsData } from '@pcs/shared-data-access';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WithDataInterceptor implements NestInterceptor {
  /**
   * Wraps every valid response inside an object as `data`.
   */
  intercept(_: ExecutionContext, next: CallHandler): Observable<TAsData<any>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
