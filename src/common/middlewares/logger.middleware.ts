
import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const startTime = Date.now();
    const requestId = randomUUID();

    res.setHeader('X-Request-ID', requestId);

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      const log = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };

      console.log('[HTTP REQUEST]', JSON.stringify(log));
    });

    next();
  }
}
