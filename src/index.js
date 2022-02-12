import archiver from './archiver.js';
import path from 'path';
const dirname = path.resolve();

const app = async (output, password, filename, type) => {
  const input = path.join(dirname, filename);
  // const targetType = await archiver.getTagetType(input);

  if (type !== 'unpack') {
    await archiver.pack(input, output, password, type);
  } else {
    await archiver.unpack(input, output, password, type);
  }
};

export default async (output, password, filename, type) => {
  try {
    await app(output, password, filename, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    if (!error.mine) {
      throw error;
    }
    console.log(message);
  }
};