import fs from 'fs';

export const resetDir = async (dirPath) => {
  try {
    const stat = await fs.promises.stat(dirPath);
    if (stat) {
      await fs.promises.rmdir(dirPath, { recursive: true });
      await fs.promises.mkdir(dirPath);
    }
  } catch (error) {
    console.log('error: ', error);
  }
};

export const getDirContent = async (path) => {
  try {
    const files = await fs.promises.readdir(path);
    return files;
  } catch (error) {
    console.log('error: ', error);
  }
};
