class ErrorMsg extends Error {
  statusCode;

  constructor(errMessage, statusCode) {
    super(errMessage);
    this.statusCode = statusCode;
  }
}

export default ErrorMsg;
