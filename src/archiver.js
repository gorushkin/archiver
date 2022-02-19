import fs from 'fs';
import { ToolError } from './error.js';
import packTool from './utils/packTool.js';
import unpackTool from './utils/unpackTool.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class Archiver {
  static async checkFile(input) {
    try {
      return await fs.promises.stat(input);
    } catch (error) {
      throw new ToolError('file is not exist');
    }
  }

  static async createTempFolder(output) {
    const tempFolderName = uuidv4();
    const tempOutputpath = path.join(output, tempFolderName);
    try {
      await fs.promises.mkdir(tempOutputpath);
      return tempOutputpath;
    } catch (error) {
      throw new ToolError(`Path ${tempOutputpath} is invalid`);
    }
  }

  static async getTagetType(input) {
    try {
      const stat = await fs.promises.stat(input);
      return stat.isFile() ? 'file' : 'directory';
    } catch (error) {
      throw new ToolError(`Path ${input} is invalid`);
    }
  }

  static async removeTempFolder(folder) {
    try {
      await fs.promises.rm(folder, { recursive: true });
    } catch (error) {
      throw new ToolError(`Path ${folder} is invalid`);
    }
  }

  static async unpack(input, output, password) {
    if (!password) throw new ToolError('Password is required');

    await this.checkFile(input);

    const { name } = path.parse(input);

    const outputPath = path.join(output, name);

    try {
      const result = await unpackTool(input, outputPath, name, password);
    } catch (error) {
      throw new ToolError(error);
    }

  }

  static async moveFile(input, output) {
    try {
      await fs.promises.rename(input, output);
    } catch (error) {
      console.log('error: ', error);
      throw new ToolError(`Path ${input} or  ${output} is invalid`);
    }
  }

  static async pack(input, output, { archiveName = 'archive.zip', password, level = 2 }) {
    await this.checkFile(input);

    const targetType = await this.getTagetType(input);

    const tempFolder = await this.createTempFolder(output);
    const tempArchName = path.join(tempFolder, archiveName);
    const tempFilename = path.basename(input);
    const firstArchiveName = await packTool(
      input,
      tempArchName,
      password,
      tempFilename,
      targetType
    );

    if (level === 2) {
      const finalArchName = path.join(output, archiveName);
      const finalFilename = path.basename(finalArchName);
      await packTool(firstArchiveName, finalArchName, password, finalFilename, 'file');
    } else {
      const finalFilename = path.join(output, archiveName);
      await this.moveFile(firstArchiveName, finalFilename);
    }

    await this.removeTempFolder(tempFolder);
  }
}

export default Archiver;
