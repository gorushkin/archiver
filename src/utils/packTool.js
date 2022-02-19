import archiver from 'archiver';
import fs from 'fs';
import { createReadStream } from 'fs';

import archiverZipEncrypted from 'archiver-zip-encrypted';

archiver.registerFormat('zip-encrypted', archiverZipEncrypted);

export default async (inputPath, outputPath, password, name, targetType) => {
  return new Promise(async (resolve, reject) => {
    const archive = password
      ? archiver('zip-encrypted', {
          zlib: { level: 8 },
          encryptionMethod: 'zip20',
          password,
        })
      : archiver('zip', {
          zlib: { level: 9 },
        });

    const output = fs.createWriteStream(outputPath);

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', () => console.log('Data has been drained'));

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    const readable = createReadStream(inputPath);

    if (targetType === 'file') archive.append(readable, { name });

    if (targetType === 'directory') {
      const dirName = inputPath.split('/').at(-1);
      archive.directory(inputPath, dirName);
    }

    archive.finalize();

    archive.on('finish', () => {
      resolve(outputPath);
    });
  });
};
