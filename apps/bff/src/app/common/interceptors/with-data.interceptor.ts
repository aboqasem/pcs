import { AsData } from '@myplatform/shared-data-access';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WithDataInterceptor implements NestInterceptor {
  /**
   * Wraps every valid response inside an object as `data`.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<AsData<any>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
