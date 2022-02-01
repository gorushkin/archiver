import archiver from 'archiver';
import fs from 'fs';
import { createReadStream } from 'fs';

export default async (inputpath: string, outputPath: string, name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const output = fs.createWriteStream(outputPath);

    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
      console.log('Data has been drained');
    });

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);

    const readable = createReadStream(inputpath);

    archive.append(readable, { name });

    archive.finalize();

    archive.on('finish', () => {
      resolve(outputPath);
    });
  });
};
