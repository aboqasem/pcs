import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, ip, originalUrl, httpVersion } = req;

    this.logger.log(`[REQUEST] ${ip} - "${method} ${originalUrl} HTTP/${httpVersion}"`);

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(`[RESPONSE] ${statusCode}`);
    });

    return next();
  }
}
