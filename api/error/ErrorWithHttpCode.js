export class ErrorWithHttpCode extends Error {
    constructor(httpCode, ...params) {
        super(...params);
        this.httpCode = httpCode;
    }
}
