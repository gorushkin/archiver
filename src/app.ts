import archiver from './archiver';
import path from 'path';
const dirname = path.resolve();

const app = async (output: string, password: string, filename: string, type: string) => {
  const input = path.join(dirname, filename);

  await archiver.pack(input, output, 'archive.zip');
};

export default async (output: string, password: string, filename: string, type: string) => {
  try {
    await app(output, password, filename, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.log(message);
  }
};
