import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = { message: 'Internal Server Error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        body = { message: res };
      } else if (res && typeof res === 'object') {
        body = res as Record<string, unknown>;
      }
    } else if (exception instanceof Error) {
      body = { message: 'Internal Server Error', error: exception.message };
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error) {
      body = { ...body, error: exception.message };
    }

    response.status(status).json(body);
  }
}
