import archiver from './archiver.js';
import path from 'path';
const dirname = path.resolve();

export default async (output, password, filename, name, type) => {
  const input = path.join(dirname, filename);

  if (type !== 'unpack') {
    await archiver.pack(input, output, { archiveName: `${name}.zip`, password, type, level: 2 });
  } else {
    await archiver.unpack(input, output, { name, password, type, level: 2 });
  }
};
