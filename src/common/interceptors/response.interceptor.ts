import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type StandardResponse = {
  success?: boolean;
  data?: unknown;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (typeof data === 'object' && data !== null && 'success' in data) {
          return data as StandardResponse;
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
