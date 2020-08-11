export class ErrorWithHttpCode extends Error {
  constructor(httpCode, message, ...params) {
    super(...params);
    this.httpCode = httpCode;
    this.message = message;
  }
}
