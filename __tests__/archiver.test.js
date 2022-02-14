import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Archiver from '../src/archiver';
import { resetDir, getDirContent, scanDir } from './helpers';
import unzipper from 'unzipper';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tempDirectoryName = 'temp';

const getPathToFixtures = (...fileName) => path.join(__dirname, '..', '__fixtures__', ...fileName);
// const getPathToFixtures = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);
const getFileFromFixtures = (path) => fs.readFileSync(getPathToFixtures(path));

const getPathToTempDir = (...fileNames) =>
  path.join(process.cwd(), tempDirectoryName, ...fileNames);

const testData = [
  {
    testGroupName: 'Pack single file',
    folderName: 'test1',
    target: 'text.txt',
    // inputName: getPathToFixtures('test1/text.txt'),
    // resultFolder: getPathToTempDir('test1'),
    // expectedFile: getPathToFixtures('test1'),
    // result: 'test1/text.txt',
    expectedArchiveName: 'archive.zip',
  },
  // {
  //   testGroupName: 'Pack directory',
  //   folderName: 'test2',
  //   inputName: getPathToFixtures('directory'),
  //   output: 'archive.zip',
  //   expectedFile: getFileFromFixtures('text.txt'),
  //   result: ['archive.zip'],
  // },
];

describe('Packing tests', () => {
  beforeAll(async () => {
    await resetDir(getPathToTempDir());
  });

  describe.each(testData.map((item) => item))(
    '$testGroupName',
    ({
      testGroupName,
      folderName,
      expectedArchiveName,
      // resultFolder,
      // expectedFile,
      // result,
      target,
    }) => {
      let dirContent;
      let expectedDirContent;
      let resultFolder;

      beforeAll(async () => {
        const targetPath = getPathToFixtures(folderName, target);
        resultFolder = getPathToTempDir(folderName);
        await fs.promises.mkdir(resultFolder);
        await Archiver.pack(targetPath, resultFolder, {
          archiveName: 'archive.zip',
          level: 1,
        });

        [dirContent] = await getDirContent(resultFolder);
      });

      test('file was packed successfuly', async () => {
        expect(dirContent).toEqual(expectedArchiveName);
      });

      // test('archive content is correct', async () => {
      //   const [archive] = await getDirContent(getPathToTempDir(folderName));

      //   const directory = await unzipper.Open.file(getPathToTempDir(folderName, archive));
      //   const file = directory.files[0];
      //   const content = await file.buffer();
      //   console.log('content: ', content);
      //   // expect(content.toString() === expectedFile.toString());
      //   expect(2).toEqual(2);
      // });

      test('archive structure is correct', async () => {
        const [archive] = await getDirContent(resultFolder);
        const directory = await unzipper.Open.file(getPathToTempDir(folderName, archive));
        const tempExtractDir = getPathToTempDir(folderName, folderName);
        await directory.extract({ path: tempExtractDir, concurrency: 5 });
        const expextedDirStucture = await scanDir(getPathToFixtures(folderName));
        const resultDirStucture = await scanDir(tempExtractDir);
        expect(expextedDirStucture).toEqual(resultDirStucture);
      });
    }
  );
});
