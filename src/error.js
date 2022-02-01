export class ToolError extends Error {
  constructor(error) {
    super(error);
    this.mine = true;
  }
}
