export class HttpException extends Error {
  constructor(message?: string, readonly status?: number) {
    super(message);
    this.name = 'HttpError';
  }
}
