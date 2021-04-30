import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../controller/error/http.error';

export default function errorHandlerMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.code);
    return res.json({
      code: err.code,
      message: err.message,
    });
  }

  res.status(500);
  return res.json({
    code: 500,
    message: err?.message || 'Internal Server Error',
  });
}
