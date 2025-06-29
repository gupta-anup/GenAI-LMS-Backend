import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    
    // Log incoming request
    this.logger.http(
      `Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`,
      'HTTP'
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const { statusCode } = response;
          
          // Log outgoing response
          this.logger.logRequest(request, response, responseTime);
          
          // Log response data in debug mode
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(
              `Response Data: ${JSON.stringify(data)}`,
              'HTTP'
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const { statusCode } = response;
          
          // Log error response
          this.logger.error(
            `Error Response: ${method} ${url} ${statusCode} - ${responseTime}ms - ${error.message}`,
            error.stack,
            'HTTP'
          );
        },
      }),
    );
  }
}
