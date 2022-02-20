export class ToolError extends Error {
  constructor(error, message) {
    super(error);
    this.message = message;
    this.mine = true;
  }
}
