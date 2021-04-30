export abstract class HttpError extends Error {

  public constructor(
    public readonly code: number,
    public readonly message: string,
  ) {
    super(message);
  }
}
