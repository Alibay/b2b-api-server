import { HttpError } from './http.error';

export class NotFoundError extends HttpError {
  public constructor(public readonly message: string) {
    super(404, message);
  }
}
