import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, ip, originalUrl, httpVersion } = req;

    const start = process.uptime();
    res.on('finish', () => {
      const end = process.uptime();
      const { statusCode } = res;
      this.logger.log(
        `${ip} - "${method} ${originalUrl} HTTP/${httpVersion}" ${statusCode} +${Math.floor(
          (end - start) * 1000,
        )}ms`,
      );
    });

    return next();
  }
}
