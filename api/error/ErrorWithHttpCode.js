export class ErrorWithHttpCode extends Error {
    constructor(code, ...params) {
        super(...params);
        this.code = code;
    }
}
