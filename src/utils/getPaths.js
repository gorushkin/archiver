import fs from 'fs';
import path from 'path';

export const getPaths = async (input) => {
  const func = async (filename, acc) => {
    const stat = await fs.promises.stat(filename);
    if (stat.isFile()) acc.push(path.relative(input, filename));
    if (stat.isDirectory()) {
      const files = await fs.promises.readdir(filename);
      await Promise.all(files.map((item) => func(path.join(filename, item), acc)));
    }
    return acc;
  };

  return await func(input, []);
};
