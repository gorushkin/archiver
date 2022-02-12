import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Archiver from '../src/archiver';
import { resetDir, getDirContent } from './helpers';
import unzipper from 'unzipper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFilePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

const tempDirectoryName = 'temp';

const getPathWithTempDir = (name) => {
  const tempDirectoryPath = path.join(process.cwd(), tempDirectoryName);

  return name ? path.join(tempDirectoryPath, name) : tempDirectoryPath;
};

const inputFilename = 'text.txt';
const inputFilePath = getFilePath(inputFilename);

const archiverResult = ['archive.zip'];

let fileContent;

const testData = [
  { folderName: 'test1', inputName: 'text.txt', output: 'archive.zip', testFileName: 'text.txt' },
  // { folderName: 'test1', inputName: 'text.txt', output: 'archive.zip', testFileName: 'text.txt' },
];

describe('pack file', () => {
  beforeAll(async () => {
    await resetDir(getPathWithTempDir());
    await Archiver.pack(inputFilePath, getPathWithTempDir(), {
      archiveName: 'archive.zip',
      level: 1,
    });
    const file = await fs.promises.readFile(inputFilePath);
    fileContent = file.toString();
  });

  test('file was packed successfuly', async () => {
    const dirContent = await getDirContent(getPathWithTempDir());
    expect(JSON.stringify(dirContent) === JSON.stringify(archiverResult));
  });

  test('archive content is correct', async () => {
    const [archive] = await getDirContent(getPathWithTempDir());

    const directory = await unzipper.Open.file(getPathWithTempDir(archive));
    const file = directory.files[0];
    const content = await file.buffer();

    expect(content.toString() === fileContent);
  });
});
