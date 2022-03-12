import fs from 'fs';
import unzipper from 'unzipper';

export default async (inputPath, outputPath, password) => {
  const directory = await unzipper.Open.file(inputPath);

  await directory.extract({ path: outputPath, password });

  // return new Promise(async (resolve, reject) => {
  //   const input = fs.createReadStream(inputPath);

  //   const output = unzipper.Extract({ path: outputPath });

  //   output.on('close', () => {
  //     console.log('unzipper has been finalized and the output file descriptor has closed.');
  //   });

  //   output.on('end', () => console.log('Data has been drained'));

  //   input.on('error', (err) => console.log(';err'));
  //   // input.on('error', (err) => reject(err));

  //   input.pipe(output);

  //   input.on('finish', () => {
  //     resolve(outputPath);
  //   });
  // });
};
