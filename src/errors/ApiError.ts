export default class ApiError extends Error {
  isExpected: true;

  constructor(message: string) {
    super(message);
  }
}
