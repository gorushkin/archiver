export class ToolError extends Error {
  mine: boolean;

  constructor(error: string) {
    super(error);
    this.mine = true;
  }
}
