export class ValidationError extends Error {
  public readonly errors: string[];

  public constructor(message: string, errors: string[] = []) {
    super(`${message}\n${errors.join('\n')}\n`);
    this.errors = errors;
  }
}
