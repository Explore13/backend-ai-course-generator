import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: unknown) => {
        const statusCode = response.statusCode || HttpStatus.OK;

        return {
          success: true,
          data: data ?? null,
          statusCode,
          message: 'Request successful',
          path: request.originalUrl || request.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
