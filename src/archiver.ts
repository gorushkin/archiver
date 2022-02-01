// import archiver from 'archiver';
import fs from 'fs';
import { ToolError } from './error';
import archiveTool from './utils';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class Archiver {
  private static async checkFile(input: string) {
    try {
      await fs.promises.stat(input);
    } catch (error) {
      throw new ToolError('file is not exist');
    }
  }

  private static async createTempFolder(output: string) {
    const tempFolderName = uuidv4();
    const tempOutputpath = path.join(output, tempFolderName);
    try {
      await fs.promises.mkdir(tempOutputpath);
      return tempOutputpath;
    } catch (error) {
      throw new ToolError(`Path ${tempOutputpath} is invalid`);
    }
  }

  private static async removeTempFolder(folder: string) {
    try {
      await fs.promises.rm(folder, { recursive: true });
    } catch (error) {
      throw new ToolError(`Path ${folder} is invalid`);
    }
  }

  static async pack(input: string, output: string, archiveName: string) {
    console.log(`we are goint to pack ${input} to ${output}`);

    await this.checkFile(input);

    const tempFolder = await this.createTempFolder(output);
    const tempArchName = path.join(tempFolder, archiveName);
    const tempFilename = path.basename(input);
    const firstArchiveName = await archiveTool(input, tempArchName, tempFilename);

    const finalArchName = path.join(output, archiveName);
    const finalFilename = path.basename(finalArchName);
    await archiveTool(firstArchiveName, finalArchName, finalFilename);

    await this.removeTempFolder(tempFolder);
  }
}

export default Archiver;
