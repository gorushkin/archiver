import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Archiver from '../src/archiver';
import { resetDir, getDirContent } from './helpers';
import unzipper from 'unzipper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDirectoryName = 'temp';

const getPathToFixtures = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);
const getFileFromFixtures = (path) => fs.readFileSync(getPathToFixtures(path));

const getPathToTempDir = (...fileNames) =>
  path.join(process.cwd(), tempDirectoryName, ...fileNames);

const testData = [
  {
    testGroupName: 'Pack single file',
    folderName: 'test1',
    inputName: getPathToFixtures('text.txt'),
    output: 'archive.zip',
    expectedFile: getFileFromFixtures('text.txt'),
    result: ['archive.zip'],
  },
];

describe('Packing tests', () => {
  beforeAll(async () => {
    await resetDir(getPathToTempDir());
  });

  describe.each(testData.map((item) => item))(
    '$testGroupName',
    ({ testGroupName, folderName, inputName, output, expectedFile, result }) => {
      let dirContent;
      beforeAll(async () => {
        await fs.promises.mkdir(getPathToTempDir(folderName));
        await Archiver.pack(inputName, getPathToTempDir(folderName), {
          archiveName: 'archive.zip',
          level: 1,
        });
        dirContent = await getDirContent(getPathToTempDir(folderName));
      });

      test('file was packed successfuly', async () => {
        expect(JSON.stringify(dirContent) === JSON.stringify(result));
      });

      test('archive content is correct', async () => {
        const [archive] = await getDirContent(getPathToTempDir(folderName));

        const directory = await unzipper.Open.file(getPathToTempDir(folderName, archive));
        const file = directory.files[0];
        const content = await file.buffer();
        expect(content.toString() === expectedFile.toString());
      });
    }
  );
});
