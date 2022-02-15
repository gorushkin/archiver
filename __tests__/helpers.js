import fs from 'fs';
import path, { dirname } from 'path';

export const resetDir = async (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) await fs.promises.rmdir(dirPath, { recursive: true });
    await fs.promises.mkdir(dirPath);
  } catch (e) {
    console.log('An error occurred.');
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

export const getDirectory = async (path) => {
  try {
    const files = await fs.promises.readdir(path);
    console.log('files: ', files);
    return files;
  } catch (error) {
    console.log('error: ', error);
  }
};

export const scanDir = async (target, view = 'simple') => {
  const getFileStat = async (filename) => {
    try {
      const stat = await fs.promises.stat(filename);
      const name = view === 'simple' ? path.basename(filename) : filename;
      if (stat.isFile()) {
        const content = (await fs.promises.readFile(filename)).toString();
        return { ...(view === 'full' && { type: 'file' }), name, content };
      }
      if (stat.isDirectory()) {
        const childrens = await readDir(filename);
        return { ...(view === 'full' && { type: 'directory' }), name, childrens };
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const readDir = async (filename) => {
    try {
      const files = await fs.promises.readdir(filename);
      const filesStats = await Promise.all(
        files.map(async (item) => await getFileStat(path.join(filename, item)))
      );
      return filesStats;
    } catch (error) {
      console.log(error);
    }
  };

  const result = await getFileStat(target);
  return result;
};
